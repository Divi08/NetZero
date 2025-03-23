import React, { useEffect, useState } from 'react';
import { CaseCard } from './cases/CaseCard';
import axios from 'axios';

interface PolicyCase {
  id: string;
  title: string;
  category: string;
  summary: string;
  facility: {
    FAC_NAME: string;
    FAC_CITY: string;
    FAC_STATE: string;
  };
  status: string;
  startDate: string;
  endDate: string;
  impact: boolean;
  objectives: string;
  aiAnalysis: string;
}

export function Dashboard() {
  const [cases, setCases] = useState<PolicyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/cases');
        setCases(response.data);
      } catch (err) {
        setError('Failed to load policy cases. Please try again later.');
        console.error('Error loading cases:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

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
