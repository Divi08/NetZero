import { GoogleGenerativeAI } from "@google/generative-ai";
import { ECHOFacility } from './echoService';

let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini(apiKey?: string) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!key) {
    console.error('Gemini API key not provided');
    return;
  }
  genAI = new GoogleGenerativeAI(key);
}

// Initialize with environment variable by default
initializeGemini();

export interface GeneratedCase {
  id: string;
  title: string;
  summary: string;
  category: string;
  facility: ECHOFacility;
}

function getViolationDescription(statute: string, status: string): string {
  const descriptions: { [key: string]: { [key: string]: string } } = {
    'CWA': {
      'SNC': 'Significant Clean Water Act Violation',
      'SNCP': 'Significant Clean Water Act Violation (Past)',
      'VN': 'Clean Water Act Violation'
    },
    'CAA': {
      'HPV': 'High Priority Clean Air Act Violation',
      'HPVP': 'High Priority Clean Air Act Violation (Past)',
      'VN': 'Clean Air Act Violation'
    },
    'RCRA': {
      'SNC': 'Significant Resource Conservation and Recovery Act Violation',
      'SNCP': 'Significant Resource Conservation and Recovery Act Violation (Past)',
      'VN': 'Resource Conservation and Recovery Act Violation'
    }
  };
  return descriptions[statute]?.[status] || `${statute} Violation (Status: ${status})`;
}

export async function generateCaseFromFacility(facility: ECHOFacility): Promise<GeneratedCase> {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please provide a valid API key.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Generate a detailed environmental case summary for the following facility:
      
      Facility Name: ${facility.FAC_NAME}
      Location: ${facility.FAC_CITY}, ${facility.FAC_STATE}
      Last Inspection: ${new Date(facility.DERIVED_LAST_INSPECTION_DATE).toLocaleDateString()}
      
      Compliance Status:
      - Clean Water Act (CWA): ${facility.CWA_3YEAR_COMPLIANCE_STATUS || 'No data'}
      - Clean Air Act (CAA): ${facility.CAA_3YEAR_COMPLIANCE_STATUS || 'No data'}
      - Resource Conservation and Recovery Act (RCRA): ${facility.RCRA_3YEAR_COMPLIANCE_STATUS || 'No data'}
      
      Violations:
      ${facility.VIOLATIONS.map(v => `- ${v.STATUTE} violation (${v.VIOLATION_TYPE_CODE}) on ${new Date(v.VIOLATION_DATE).toLocaleDateString()}`).join('\n')}
      
      Please provide:
      1. A clear title for this case
      2. A detailed summary of the environmental concerns
      3. A category (e.g., "Air Quality", "Water Quality", "Waste Management", "Multiple Violations")
      
      Format the response as JSON with the following structure:
      {
        "title": "...",
        "summary": "...",
        "category": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const generated = JSON.parse(text);

    return {
      id: facility.REGISTRY_ID,
      title: generated.title,
      summary: generated.summary,
      category: generated.category,
      facility: facility
    };
  } catch (error) {
    console.error('Error generating case from facility:', error);
    
    // Return a basic case if generation fails
    return {
      id: facility.REGISTRY_ID,
      title: `Environmental Review: ${facility.FAC_NAME}`,
      summary: `This case involves potential environmental violations at ${facility.FAC_NAME} in ${facility.FAC_CITY}, ${facility.FAC_STATE}. The facility requires review of its compliance status and recent violations.`,
      category: "Environmental Review",
      facility: facility
    };
  }
} 