import { useEffect, useState } from 'react';
import { CaseCard } from '@/components/cases/CaseCard';
import { fetchECHOFacilities } from '@/services/echoService';
import { generateCaseFromFacility, GeneratedCase } from '@/services/geminiService';

export default function Dashboard() {
  const [cases, setCases] = useState<GeneratedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const facilities = await fetchECHOFacilities();
        const generatedCases = await Promise.all(
          facilities.slice(0, 10).map(facility => generateCaseFromFacility(facility))
        );
        setCases(generatedCases);
      } catch (err) {
        setError('Failed to load cases. Please try again later.');
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
          <p className="text-slate-400">Active environmental violation cases from EPA ECHO</p>
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

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseData) => (
            <CaseCard key={caseData.id} caseData={caseData} />
          ))}
        </div>
      )}
    </div>
  );
}
