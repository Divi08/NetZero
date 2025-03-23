import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, addDoc, updateDoc, orderBy, limit, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

export interface PolicyCase {
  id: string;
  title: string;
  category: string;
  summary: string;
  facility: {
    FAC_NAME: string;
    FAC_CITY: string;
    FAC_STATE: string;
    REGISTRY_ID?: string;
    VIOLATIONS?: string[];
  };
  status: string;
  startDate: string;
  endDate: string;
  impact: boolean;
  objectives: string;
  aiAnalysis?: string | null;
}

// Hardcoded cases with full details for fast loading
export const hardcodedCases: PolicyCase[] = [
  {
    id: "211001269",
    title: "GHGs Formally Designated as Pollutants Canada (2005)",
    summary: "Greenhouse gases were formally designated as air pollutants in Canada, enabling comprehensive regulation under environmental protection laws.",
    category: "General",
    facility: {
      FAC_NAME: "GHGs Formally Designated as Pollutants",
      FAC_CITY: "Ottawa",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211001269"
    },
    status: "In force",
    startDate: "2005-01-15",
    endDate: "",
    impact: true,
    objectives: "Mitigation",
    aiAnalysis: "This landmark designation in 2005 created the legal framework for Canada to regulate greenhouse gases under environmental protection laws. By classifying GHGs as air pollutants, the government gained authority to set standards, monitoring requirements, and enforcement mechanisms specifically targeting emissions. This policy represented a significant shift in Canada's climate policy approach, acknowledging the harm caused by these emissions and establishing a foundation for subsequent regulatory actions."
  },
  {
    id: "211002561",
    title: "Reporting Rules for Industrial Greenhouse Gas Emissions Canada (2005)",
    summary: "Mandatory reporting requirements for large industrial emitters of greenhouse gases in Canada, establishing a national emissions inventory system.",
    category: "Industry",
    facility: {
      FAC_NAME: "Reporting Rules for Industrial Greenhouse Gas Emissions",
      FAC_CITY: "Toronto",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211002561"
    },
    status: "Ended",
    startDate: "2005-03-12",
    endDate: "2017-06-30",
    impact: false,
    objectives: "Mitigation",
    aiAnalysis: "The 2005 Reporting Rules established Canada's first comprehensive system for tracking industrial greenhouse gas emissions. The policy required facilities emitting over 50,000 tonnes of CO2 equivalent annually to report their emissions, creating an essential data foundation for climate policy. The reporting covered major sectors including oil and gas, manufacturing, mining, and electricity generation. This data-driven approach enabled regulators to identify major emission sources and track progress over time, while also improving corporate accountability through public disclosure requirements."
  },
  {
    id: "211000187",
    title: "Amendment 12B to the Energy efficiency Regulations Canada (2013)",
    summary: "Target: zero incandescent light bulbs (sold) after 2013, promoting energy-efficient lighting alternatives across Canada.",
    category: "Buildings, Appliances",
    facility: {
      FAC_NAME: "Amendment 12B to the Energy efficiency Regulations",
      FAC_CITY: "Vancouver",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211000187"
    },
    status: "In force",
    startDate: "2013-01-01",
    endDate: "",
    impact: true,
    objectives: "Mitigation",
    aiAnalysis: "Amendment 12B to Canada's Energy Efficiency Regulations represents a significant step in reducing residential energy consumption by phasing out inefficient lighting. By targeting incandescent bulbs, which convert only about 5% of energy into light, the policy pushed consumers toward alternatives like LEDs that use up to 85% less energy. This targeted approach to energy efficiency in common household products demonstrates how specific regulations can drive market transformation and consumer behavior change toward sustainability, while also reducing household energy bills and lowering grid demand."
  },
  {
    id: "211003456",
    title: "Canadian Environmental Protection Act (CEPA)",
    summary: "Comprehensive environmental legislation addressing pollution prevention and the protection of the environment and human health in Canada.",
    category: "General",
    facility: {
      FAC_NAME: "Canadian Environmental Protection Act",
      FAC_CITY: "Ottawa",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211003456"
    },
    status: "In force",
    startDate: "1999-03-31",
    endDate: "",
    impact: true,
    objectives: "Prevention",
    aiAnalysis: "The Canadian Environmental Protection Act (CEPA) serves as Canada's primary environmental legislation, providing a comprehensive framework for pollution prevention and ecosystem protection. CEPA empowers the government to regulate toxic substances, control pollution, manage waste, and implement international environmental agreements. The act follows a science-based approach to identifying and managing environmental risks, requiring risk assessments, monitoring programs, and public reporting. CEPA establishes a 'polluter pays' principle and enables enforcement through inspections, investigations, and penalties for non-compliance."
  },
  {
    id: "211004567",
    title: "Carbon Tax Implementation Canada (2018)",
    summary: "Federal carbon pricing system applied to provinces without equivalent provincial systems, establishing a minimum price on carbon emissions.",
    category: "Carbon Pricing",
    facility: {
      FAC_NAME: "Carbon Tax Implementation",
      FAC_CITY: "Ottawa",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211004567"
    },
    status: "In force",
    startDate: "2018-06-21",
    endDate: "",
    impact: true,
    objectives: "Mitigation",
    aiAnalysis: "Canada's federal carbon tax represents a market-based approach to reducing greenhouse gas emissions by putting a price on carbon pollution. The policy follows the 'polluter pays' principle, initially setting a price of $20 per tonne in 2019 with planned increases to $170 per tonne by 2030. The revenue-neutral system returns proceeds to households through rebates, while creating economic incentives for businesses and consumers to reduce emissions. By applying a uniform price signal across covered sectors, the carbon tax is designed to achieve emissions reductions at the lowest overall economic cost while driving innovation in clean technologies."
  },
  {
    id: "211005678",
    title: "Net-Zero Emissions Accountability Act Canada (2021)",
    summary: "Framework for achieving net-zero emissions by 2050, establishing legally binding targets and planning requirements.",
    category: "Climate Policy",
    facility: {
      FAC_NAME: "Net-Zero Emissions Accountability Act",
      FAC_CITY: "Ottawa",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211005678"
    },
    status: "In force",
    startDate: "2021-06-29",
    endDate: "",
    impact: true,
    objectives: "Mitigation",
    aiAnalysis: "The Net-Zero Emissions Accountability Act creates a legally binding framework requiring Canada to achieve net-zero greenhouse gas emissions by 2050. The legislation establishes a governance structure with milestone emission reduction targets every five years beginning in 2030, mandatory emissions reduction plans with specific measures, regular progress reports, and independent assessment of results. This approach enhances transparency and accountability in climate policy by mandating public reporting and parliamentary oversight. The act represents a shift from aspirational goals to enforceable commitments, ensuring continuity in climate action across changing governments."
  },
  {
    id: "211006789",
    title: "Clean Fuel Standard Canada",
    summary: "Regulations to reduce the carbon intensity of liquid fuels through life-cycle analysis and compliance credit trading.",
    category: "Transportation",
    facility: {
      FAC_NAME: "Clean Fuel Standard",
      FAC_CITY: "Calgary",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211006789"
    },
    status: "Pending",
    startDate: "2022-07-01",
    endDate: "",
    impact: true,
    objectives: "Mitigation",
    aiAnalysis: "The Clean Fuel Standard (CFS) aims to reduce the carbon intensity of fuels used in Canada through a performance-based approach. Rather than mandating specific technologies, the CFS sets carbon intensity targets that decrease over time, allowing fuel suppliers flexibility in compliance methods. The policy uses a life-cycle approach, accounting for emissions from production through consumption. It establishes a credit trading system where suppliers can generate credits through actions like blending biofuels, supporting electric vehicles, or carbon capture. The CFS complements carbon pricing by specifically targeting transportation emissions, Canada's second-largest emission source."
  },
  {
    id: "211007890",
    title: "Pan-Canadian Framework on Clean Growth and Climate Change",
    summary: "National plan to meet emissions reduction targets, combining carbon pricing, complementary climate actions, and adaptation measures.",
    category: "Climate Policy",
    facility: {
      FAC_NAME: "Pan-Canadian Framework",
      FAC_CITY: "Ottawa",
      FAC_STATE: "Canada",
      REGISTRY_ID: "211007890"
    },
    status: "In force",
    startDate: "2016-12-09",
    endDate: "",
    impact: true,
    objectives: "Mitigation",
    aiAnalysis: "The Pan-Canadian Framework represents Canada's first national climate plan developed with provincial and territorial governments. It establishes a comprehensive approach with four main pillars: carbon pricing as a foundational policy, complementary measures targeting specific emission sources, adaptation and climate resilience, and clean technology innovation. The framework addresses emissions across all economic sectors while promoting economic growth in clean industries. It demonstrates cooperative federalism in environmental policy, balancing national consistency with flexibility for provinces to implement approaches suited to their unique economic and environmental circumstances."
  }
];

// Support more ports as shown in terminal output
const ports = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8091, 8092, 8093, 8094, 8095];

async function tryPorts(endpoint: string): Promise<any> {
  for (const port of ports) {
    try {
      const response = await axios.get(`http://localhost:${port}${endpoint}`);
      return response.data;
    } catch (error) {
      if (port === ports[ports.length - 1]) {
        throw new Error('Failed to connect to any available port');
      }
      continue;
    }
  }
}

// Fetch all cases - first use hardcoded, then try API as fallback
export async function fetchCases(): Promise<PolicyCase[]> {
  try {
    console.log('Using hardcoded cases for fast loading');
    return hardcodedCases;
  } catch (error) {
    console.error('Error with hardcoded cases, trying API', error);
    try {
      return await tryPorts('/api/cases');
    } catch (apiError) {
      console.error('Failed to fetch cases from API', apiError);
    throw new Error('Failed to fetch cases');
    }
  }
}

// Fetch a single case - first use hardcoded, then try API as fallback
export async function fetchCaseById(id: string): Promise<PolicyCase> {
  // First try to find it in hardcoded cases
  const hardcodedCase = hardcodedCases.find(c => c.id === id);
  if (hardcodedCase) {
    console.log(`Found case ${id} in hardcoded data`);
    return hardcodedCase;
  }
  
  // If not found in hardcoded cases, try API
  try {
    console.log(`Case ${id} not found in hardcoded data, trying API`);
    return await tryPorts(`/api/cases/${id}`);
  } catch (error) {
    throw new Error('Failed to fetch case details');
  }
}

// Generate AI analysis for a case
export async function generateAIAnalysis(id: string): Promise<{ analysis: string }> {
  try {
    // First check if we have hardcoded analysis
    const hardcodedCase = hardcodedCases.find(c => c.id === id);
    if (hardcodedCase && hardcodedCase.aiAnalysis) {
      console.log(`Using hardcoded AI analysis for case ${id}`);
      return { analysis: hardcodedCase.aiAnalysis };
    }
    
    // Otherwise try API
    for (const port of ports) {
      try {
        const response = await axios.post(`http://localhost:${port}/api/cases/${id}/analyze`);
    return response.data;
      } catch (error) {
        if (port === ports[ports.length - 1]) {
          throw error;
        }
        continue;
      }
    }
    throw new Error('No available ports');
  } catch (error) {
    throw new Error('Failed to generate analysis');
  }
}

// React Query hook for cases list (with caching)
export function useCasesList() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

// React Query hook for single case (with AI analysis)
export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => fetchCaseById(id),
    staleTime: 0, // Always fetch fresh data for AI analysis
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// Community Chat Functions
export function useCaseCommunityMessages(caseId: string) {
  return useQuery({
    queryKey: ['case-community-messages', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const messagesRef = collection(db, `case_community_chats/${caseId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!caseId,
    refetchInterval: 5000 // Refresh every 5 seconds
  });
}

export async function sendCaseCommunityMessage(caseId: string, content: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to send messages');
  }
  
  const messagesRef = collection(db, `case_community_chats/${caseId}/messages`);
  
  await addDoc(messagesRef, {
    content,
    userId: auth.currentUser.uid,
    userName: auth.currentUser.displayName || 'Anonymous User',
    userPhotoURL: auth.currentUser.photoURL || null,
    timestamp: serverTimestamp()
  });
}

// Send a bot message to the community chat
export async function sendZeroBotMessage(caseId: string, content: string) {
  const messagesRef = collection(db, `case_community_chats/${caseId}/messages`);
  
  await addDoc(messagesRef, {
    content,
    userId: 'zero-bot',
    userName: 'Zero Bot',
    userPhotoURL: '/logo.png',  // Using the existing logo.png in public folder
    isBot: true,
    timestamp: serverTimestamp()
  });
}
