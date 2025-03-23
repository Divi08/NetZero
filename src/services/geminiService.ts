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