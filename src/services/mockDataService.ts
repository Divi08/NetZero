import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PolicyCase } from './caseService';

// Initialize the Gemini API client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini Flash model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface FacilityMockData {
  facilityName: string;
  registryId: string;
  location: string;
  complianceHistory: {
    violations: {
      date: string;
      description: string;
      status: string;
    }[];
  };
  caseTimeline: {
    date: string;
    event: string;
  }[];
  startDate: string;
  status: string;
  expectedResolution: string;
}

/**
 * Generate mock facility data for a case using Gemini
 */
export async function generateMockFacilityData(caseData: PolicyCase): Promise<FacilityMockData> {
  // Validate case data - guard against undefined or no ID
  if (!caseData || !caseData.id) {
    console.warn('Missing case data or case ID, returning default mock data');
    return generateDefaultMockData(caseData || { id: 'unknown' } as PolicyCase);
  }

  // First check if we already have generated data for this case
  try {
    const mockDataDoc = await getDoc(doc(db, 'case_mock_data', caseData.id));
    if (mockDataDoc.exists()) {
      console.log('Using cached mock data for case:', caseData.id);
      return mockDataDoc.data() as FacilityMockData;
    }
  } catch (error) {
    console.error('Error checking for existing mock data:', error);
    // Continue with generation instead of failing
  }
  
  // If no cached data, generate new data
  console.log('Generating new mock data for case:', caseData.id);
  
  const prompt = `
    Generate realistic but fictional mock data for an environmental policy case with the following details:
    
    Title: ${caseData.title || 'Untitled Case'}
    Category: ${caseData.category || 'Environmental Compliance'}
    Summary: ${caseData.summary || 'No summary provided'}
    Status: ${caseData.status || 'Active'}
    Impact Level: ${caseData.impact ? 'High' : 'Moderate'}
    Objectives: ${caseData.objectives || 'Not specified'}
    
    Create JSON data with the following structure:
    {
      "facilityName": "A realistic facility name related to this case",
      "registryId": "A realistic registry ID (alphanumeric)",
      "location": "City, State",
      "complianceHistory": {
        "violations": [
          {
            "date": "YYYY-MM-DD",
            "description": "Brief description of violation",
            "status": "Resolved or Pending"
          }
        ]
      },
      "caseTimeline": [
        {
          "date": "YYYY-MM-DD",
          "event": "Description of a key event in the case"
        }
      ],
      "startDate": "YYYY-MM-DD",
      "status": "Current detailed status",
      "expectedResolution": "Expected resolution information"
    }
    
    IMPORTANT: Generate exactly 3 violations and 4 timeline events. Make sure all dates are realistic and chronological. Only return valid JSON without any explanation or markdown formatting.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from the response (in case there's any extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const mockData = JSON.parse(jsonMatch[0]) as FacilityMockData;
    
    // Store the generated data
    try {
      await setDoc(doc(db, 'case_mock_data', caseData.id), mockData);
    } catch (saveError) {
      console.error('Error saving mock data to Firestore:', saveError);
      // We can still return the data even if saving fails
    }
    
    return mockData;
  } catch (error) {
    console.error('Error generating mock data:', error);
    return generateDefaultMockData(caseData);
  }
}

/**
 * Generate default mock data as a fallback
 */
function generateDefaultMockData(caseData: PolicyCase): FacilityMockData {
  return {
    facilityName: caseData.facility?.FAC_NAME || 'Echo Environmental Facility',
    registryId: caseData.facility?.REGISTRY_ID || 'REG123456',
    location: `${caseData.facility?.FAC_CITY || 'Seattle'}, ${caseData.facility?.FAC_STATE || 'WA'}`,
    complianceHistory: {
      violations: [
        {
          date: '2023-01-15',
          description: 'Emissions reporting discrepancy',
          status: 'Resolved'
        },
        {
          date: '2023-06-22',
          description: 'Water quality standard violation',
          status: 'Pending'
        },
        {
          date: '2024-02-10',
          description: 'Documentation non-compliance',
          status: 'Pending'
        }
      ]
    },
    caseTimeline: [
      {
        date: '2023-01-05',
        event: 'Initial assessment conducted'
      },
      {
        date: '2023-03-18',
        event: 'Policy review initiated'
      },
      {
        date: '2023-08-12',
        event: 'Community stakeholder engagement'
      },
      {
        date: '2024-01-20',
        event: 'Policy recommendation draft completed'
      }
    ],
    startDate: '2023-01-05',
    status: caseData.status || 'Active',
    expectedResolution: '2024-12-15'
  };
}

/**
 * Fetch mock facility data for a case
 */
export async function fetchMockFacilityData(caseId: string): Promise<FacilityMockData | null> {
  if (!caseId) {
    console.warn('No case ID provided to fetchMockFacilityData');
    return null;
  }

  try {
    const mockDataDoc = await getDoc(doc(db, 'case_mock_data', caseId));
    if (mockDataDoc.exists()) {
      return mockDataDoc.data() as FacilityMockData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching mock data:', error);
    return null;
  }
} 