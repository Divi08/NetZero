import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Gemini API Key available:', !!apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini Flash model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Process a chat prompt directed at Zero bot
 * @param prompt The main prompt text (after @zero)
 * @param contextMessages Previous messages for context (up to 3-4)
 * @returns AI response text
 */
export async function getZeroBotResponse(prompt: string, contextMessages: string[]): Promise<string> {
  console.log('Calling Gemini API with prompt:', prompt);
  console.log('Context messages:', contextMessages);
  
  try {
    // Extract case information from context messages
    const caseInfoMessage = contextMessages.find(msg => msg.includes("This conversation is about an environmental case"));
    
    // Extract structured data about the case
    let caseDetails = {
      title: 'Unknown',
      facility: 'Unknown',
      location: 'Unknown',
      status: 'Unknown',
      summary: 'No summary available'
    };
    
    if (caseInfoMessage) {
      // Parse out key information from the context string
      const titleMatch = caseInfoMessage.match(/environmental case: "([^"]+)"/);
      if (titleMatch) caseDetails.title = titleMatch[1];
      
      const facilityMatch = caseInfoMessage.match(/Facility: ([^(in)]+) in/);
      if (facilityMatch) caseDetails.facility = facilityMatch[1].trim();
      
      const locationMatch = caseInfoMessage.match(/in ([^,]+), ([^.]+)/);
      if (locationMatch) caseDetails.location = `${locationMatch[1]}, ${locationMatch[2]}`.trim();
      
      const statusMatch = caseInfoMessage.match(/Case status: ([^.]+)/);
      if (statusMatch) caseDetails.status = statusMatch[1].trim();
      
      const summaryMatch = caseInfoMessage.match(/Case summary: ([^.]+)/);
      if (summaryMatch) caseDetails.summary = summaryMatch[1].trim();
    }
    
    // Prepare context from previous messages
    const conversationContext = contextMessages
      .filter(msg => !msg.includes("This conversation is about an environmental case"))
      .map(msg => msg.trim())
      .join('\n');
    
    // Create a well-structured case profile for the AI
    const caseProfile = `
CASE PROFILE:
Title: ${caseDetails.title}
Facility: ${caseDetails.facility}
Location: ${caseDetails.location}
Status: ${caseDetails.status}
Summary: ${caseDetails.summary}

Common environmental issues for this type of case typically include:
- Air quality violations (emissions, particulates)
- Water contamination concerns
- Compliance with EPA regulations
- Community health impacts
- Remediation requirements
`;
    
    // Create the full prompt with specific instructions and context
    const fullPrompt = `
You are Zero, an expert environmental policy assistant bot specialized in EPA cases and regulations.
You have the following information about the current environmental case:

${caseProfile}

Previous conversation:
${conversationContext}

User asked: ${prompt}

INSTRUCTIONS:
1. Provide informative, accurate responses about this specific environmental case.
2. Always reference the case title, facility name, and location in your response.
3. If you don't know specific details about a part of the case, make reasonable inferences based on the case type, location, and status.
4. Keep responses conversational but authoritative - you are an expert in environmental policy.
5. Include specific references to relevant environmental laws and regulations when possible (Clean Air Act, Clean Water Act, etc.)
6. For facility questions, mention the location and any known details from the case profile.
7. NEVER say you don't have information or that you're an AI. Instead, focus on what you do know about this type of environmental case.
8. Suggest likely regulatory frameworks that would apply to this facility and case.

EXAMPLES OF GOOD RESPONSES:
- "The ${caseDetails.title} case involves the ${caseDetails.facility} facility in ${caseDetails.location}. Based on similar cases, this facility likely needs to address emissions standards under the Clean Air Act."
- "This ${caseDetails.status} case regarding ${caseDetails.facility} would typically require quarterly testing for common pollutants as part of the compliance process."
- "Looking at the case summary for ${caseDetails.title}, we can see that this is primarily concerned with ${caseDetails.summary}, which is regulated under EPA guidelines for industrial facilities."

Your response (be concise, informative and helpful):`;
    
    console.log('Full prompt being sent to Gemini:', fullPrompt);
    
    // Call the Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Received response from Gemini:', text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I'm experiencing technical difficulties accessing the case database right now. Please try your question again in a moment.";
  }
}

export interface GeneratedCase {
  id: string;
  title: string;
  category: string;
  summary: string;
  facility: {
    REGISTRY_ID: string;
    FAC_NAME: string;
    FAC_CITY: string;
    FAC_STATE: string;
    VIOLATIONS: any[];
  };
  status: string;
  startDate: string;
  endDate: string;
  impact: boolean;
  objectives: string;
  aiAnalysis?: string;
} 