import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

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

const ports = [8080, 8081, 8082, 8083];

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

// Fetch all cases
export async function fetchCases(): Promise<PolicyCase[]> {
  try {
    return await tryPorts('/api/cases');
  } catch (error) {
    throw new Error('Failed to fetch cases');
  }
}

// Fetch a single case with AI analysis
export async function fetchCaseById(id: string): Promise<PolicyCase> {
  try {
    return await tryPorts(`/api/cases/${id}`);
  } catch (error) {
    throw new Error('Failed to fetch case details');
  }
}

// Generate AI analysis for a case
export async function generateAIAnalysis(id: string): Promise<{ analysis: string }> {
  try {
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
