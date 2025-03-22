import { useEffect, useState } from 'react';
import { CaseCard } from "./CaseCard";
import { fetchECHOFacilities } from '@/services/echoService';
import { generateCaseFromFacility, GeneratedCase } from '@/services/geminiService';

export function CaseList() {
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {error && (
        <div className="col-span-full text-red-500 text-center py-4 bg-red-500/10 rounded-lg">
          {error}
        </div>
      )}
      {cases.map((caseData, index) => (
        <CaseCard key={caseData?.id || index} caseData={caseData} />
      ))}
    </div>
  );
}
