import axios, { AxiosError } from 'axios';

// The base URL for the ECHO API
const ECHO_API_BASE_URL = 'https://echo.epa.gov/api/facility_search';

// Utility function to retry failed requests
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.warn(`Request failed, retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, retries - 1, delay * 1.5);
  }
}

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
    // First, let's get facilities with recent violations
    const response = await retryRequest(() => 
      axios.get(ECHO_API_BASE_URL, {
        params: {
          output: 'JSON',
          p_first_row: '0',
          p_count: '20',
          p_sort: '-FAC_LAST_PENALTY_DT', // Sort by most recent penalty date
          p_all: 'yes', // Include all media programs
          p_active_status: 'Y', // Only active facilities
          p_has_violation: 'Y' // Only facilities with violations
        }
      })
    );

    console.log('Initial API Response:', response.data);

    if (!response.data || !Array.isArray(response.data.Results)) {
      console.error('Invalid response format:', response.data);
      return [];
    }

    // Get detailed information for each facility
    const facilityPromises = response.data.Results.slice(0, 20).map(async (facility: any) => {
      try {
        const [detailResponse, complianceResponse] = await Promise.all([
          retryRequest(() => 
            axios.get(`${ECHO_API_BASE_URL}/detailed_facility_report`, {
              params: {
                p_id: facility.REGISTRY_ID,
                output: 'JSON'
              }
            })
          ),
          retryRequest(() => 
            axios.get(`${ECHO_API_BASE_URL}/compliance_history`, {
              params: {
                p_id: facility.REGISTRY_ID,
                output: 'JSON'
              }
            })
          )
        ]);

        const facilityDetail = detailResponse.data.Results?.[0] || {};
        const compliance = complianceResponse.data.Results?.[0] || {};

        // Construct the facility object with all required information
        return {
          REGISTRY_ID: facility.REGISTRY_ID,
          FAC_NAME: facilityDetail.FAC_NAME || facility.FAC_NAME || 'Unknown Facility',
          FAC_CITY: facilityDetail.FAC_CITY || facility.FAC_CITY || 'Unknown City',
          FAC_STATE: facilityDetail.FAC_STATE || facility.FAC_STATE || 'Unknown State',
          FAC_ZIP: facilityDetail.FAC_ZIP || facility.FAC_ZIP || '',
          FAC_ACTIVE_FLAG: facilityDetail.FAC_ACTIVE_FLAG || facility.FAC_ACTIVE_FLAG || 'Y',
          DERIVED_LAST_INSPECTION_DATE: facilityDetail.DERIVED_LAST_INSPECTION_DATE || new Date().toISOString(),
          CWA_3YEAR_COMPLIANCE_STATUS: compliance.CWA_3YEAR_COMPLIANCE_STATUS || '',
          CAA_3YEAR_COMPLIANCE_STATUS: compliance.CAA_3YEAR_COMPLIANCE_STATUS || '',
          RCRA_3YEAR_COMPLIANCE_STATUS: compliance.RCRA_3YEAR_COMPLIANCE_STATUS || '',
          VIOLATIONS: (compliance.VIOLATIONS || []).map((v: any) => ({
            STATUTE: v.STATUTE_CODE || 'Unknown',
            VIOLATION_TYPE_CODE: v.VIOLATION_TYPE_CODE || 'Unknown',
            VIOLATION_DATE: v.VIOLATION_DATE || new Date().toISOString()
          }))
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error fetching facility details:', {
          facilityId: facility.REGISTRY_ID,
          status: axiosError.response?.status,
          message: axiosError.message
        });
        return null;
      }
    });

    const facilities = await Promise.all(facilityPromises);
    const validFacilities = facilities.filter((f): f is ECHOFacility => f !== null);

    if (validFacilities.length === 0) {
      console.error('No valid facilities found after processing');
    }

    return validFacilities;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching ECHO facilities:', {
      status: axiosError.response?.status,
      message: axiosError.message,
      config: axiosError.config
    });
    return [];
  }
} 