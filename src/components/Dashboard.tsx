import React, { useEffect, useState } from 'react';
import { fetchECHOFacilities } from '../services/echoService';
import { generateCaseFromFacility, GeneratedCase } from '../services/geminiService';
import { CaseCard } from './cases/CaseCard';

export default function Dashboard() {
  const [cases, setCases] = useState<GeneratedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        setError(null);
        
        const facilities = await fetchECHOFacilities();
        if (!facilities.length) {
          setError('No facilities found');
          return;
        }

        const generatedCases = await Promise.all(
          facilities.map(facility => generateCaseFromFacility(facility))
        );

        setCases(generatedCases.filter(c => c !== null));
      } catch (err) {
        console.error('Error loading cases:', err);
        setError('Failed to load cases. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Environmental Cases Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map(caseData => (
          <CaseCard key={caseData.id} caseData={caseData} />
        ))}
      </div>
    </div>
  );
} 