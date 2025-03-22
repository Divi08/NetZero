import { useEffect, useState } from 'react';
import { CaseCard } from '@/components/cases/CaseCard';
import { fetchECHOFacilities } from '@/services/echoService';
import { generateCaseFromFacility, GeneratedCase } from '@/services/geminiService';

export default function Dashboard() {
  const [cases, setCases] = useState<GeneratedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCases() {
      try {
        setLoading(true);
        setError(null);
        
        // Create loading placeholders
        setCases(Array(6).fill(null));
        
        const facilities = await fetchECHOFacilities();
        
        if (!mounted) return;
        
        if (facilities.length === 0) {
          setError('No facilities found. Please try again later.');
          return;
        }

        const generatedCases = await Promise.all(
          facilities.slice(0, 10).map(async facility => {
            try {
              return await generateCaseFromFacility(facility);
            } catch (err) {
              console.error('Error generating case for facility:', facility.REGISTRY_ID, err);
              return null;
            }
          })
        );

        if (!mounted) return;

        // Filter out any null cases from failed generations
        const validCases = generatedCases.filter((c): c is GeneratedCase => c !== null);
        
        if (validCases.length === 0) {
          setError('Unable to generate cases. Please try again later.');
          return;
        }

        setCases(validCases);
      } catch (err) {
        console.error('Error loading cases:', err);
        setError('Failed to load cases. Please try again later.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCases();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Environmental Cases</h1>
          <p className="text-slate-400">Active environmental violation cases from EPA ECHO</p>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-center py-4 bg-red-500/10 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((caseData, index) => (
          <CaseCard 
            key={caseData?.id || index} 
            caseData={caseData}
          />
        ))}
      </div>
    </div>
  );
}
