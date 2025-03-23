import React, { useEffect, useState } from 'react';
import { CaseCard } from './cases/CaseCard';
import { useCasesList, PolicyCase, hardcodedCases } from '@/services/caseService';

export function Dashboard() {
  const [cases, setCases] = useState<PolicyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the React Query hook for optimized data fetching
  const { data: queryCases, isLoading: queryLoading, error: queryError } = useCasesList();

  useEffect(() => {
    try {
      setLoading(true);
      
      // First check if we have data from React Query
      if (queryCases && Array.isArray(queryCases) && queryCases.length > 0) {
        console.log('Using React Query data for cases');
        setCases(queryCases);
      } else {
        // Use hardcoded cases directly
        console.log('Using hardcoded cases for dashboard');
        setCases(hardcodedCases);
      }
    } catch (err) {
      console.error('Error loading cases:', err);
      // Always fall back to hardcoded cases
      setCases(hardcodedCases);
    } finally {
      setLoading(false);
    }
  }, [queryCases]);

  // Handle React Query loading state
  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
    } else if (queryError) {
      console.error('Error in React Query fetch:', queryError);
      // If there's an error with React Query, use hardcoded cases
      setCases(hardcodedCases);
      setLoading(false);
    }
  }, [queryLoading, queryError]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Environmental Cases</h1>
          <p className="text-slate-400">Active environmental policy cases with AI-powered analysis</p>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No policy cases found</p>
        </div>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseData) => (
            <CaseCard key={caseData.id} caseData={caseData} />
          ))}
        </div>
      )}
    </div>
  );
} 
