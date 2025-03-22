import axios from 'axios';

// The base URL for the ECHO API
const ECHO_API_BASE_URL = 'https://enviro.epa.gov/enviro/efservice/AIR_FORMAL_ACTIONS';

export interface ECHOFacility {
  REGISTRY_ID: string;
  FAC_NAME: string;
  FAC_CITY: string;
  FAC_STATE: string;
  FAC_ZIP: string;
  FAC_ACTIVE_FLAG: string;
  DERIVED_LAST_INSPECTION_DATE: string;
  CWA_3YEAR_COMPLIANCE_STATUS: string;
  CAA_3YEAR_COMPLIANCE_STATUS: string;
  RCRA_3YEAR_COMPLIANCE_STATUS: string;
  VIOLATIONS: {
    STATUTE: string;
    VIOLATION_TYPE_CODE: string;
    VIOLATION_DATE: string;
  }[];
}

export async function fetchECHOFacilities(): Promise<ECHOFacility[]> {
  try {
    // First, let's get the facility IDs with formal actions
    const response = await axios.get(`${ECHO_API_BASE_URL}/JSON`, {
      params: {
        output: 'JSON',
        p_first_row: '0',
        p_count: '20'
      }
    });

    console.log('Initial API Response:', response.data);

    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid response format:', response.data);
      return [];
    }

    // Get detailed information for each facility
    const facilityPromises = response.data.slice(0, 20).map(async (action: any) => {
      try {
        const detailResponse = await axios.get(
          `https://enviro.epa.gov/enviro/efservice/FACILITY_INFO/REGISTRY_ID/${action.REGISTRY_ID}/JSON`
        );

        const facility = detailResponse.data[0] || {};

        // Get compliance status
        const complianceResponse = await axios.get(
          `https://enviro.epa.gov/enviro/efservice/COMPLIANCE_STATUS/REGISTRY_ID/${action.REGISTRY_ID}/JSON`
        );

        const compliance = complianceResponse.data[0] || {};

        // Construct the facility object with all required information
        return {
          REGISTRY_ID: facility.REGISTRY_ID || action.REGISTRY_ID,
          FAC_NAME: facility.FAC_NAME || 'Unknown Facility',
          FAC_CITY: facility.FAC_CITY || 'Unknown City',
          FAC_STATE: facility.FAC_STATE || 'Unknown State',
          FAC_ZIP: facility.FAC_ZIP || '',
          FAC_ACTIVE_FLAG: facility.FAC_ACTIVE_FLAG || 'Y',
          DERIVED_LAST_INSPECTION_DATE: facility.DERIVED_LAST_INSPECTION_DATE || new Date().toISOString(),
          CWA_3YEAR_COMPLIANCE_STATUS: compliance.CWA_3YEAR_COMPLIANCE_STATUS || '',
          CAA_3YEAR_COMPLIANCE_STATUS: compliance.CAA_3YEAR_COMPLIANCE_STATUS || '',
          RCRA_3YEAR_COMPLIANCE_STATUS: compliance.RCRA_3YEAR_COMPLIANCE_STATUS || '',
          VIOLATIONS: [
            {
              STATUTE: action.STATUTE_CODE || 'CAA',
              VIOLATION_TYPE_CODE: action.ENF_TYPE_CODE || 'VN',
              VIOLATION_DATE: action.SETTLEMENT_ENTERED_DATE || new Date().toISOString()
            }
          ]
        };
      } catch (error) {
        console.error('Error fetching facility details:', error);
        return null;
      }
    });

    const facilities = await Promise.all(facilityPromises);
    return facilities.filter((f): f is ECHOFacility => f !== null);

  } catch (error) {
    console.error('Error fetching ECHO facilities:', error);
    return [];
  }
} 