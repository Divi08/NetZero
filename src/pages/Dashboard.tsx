import { useState, useMemo } from 'react';
import { CaseCard } from '@/components/cases/CaseCard';
import { useCasesList } from '@/services/caseService';
import { Loader2, ArrowUpDown } from 'lucide-react';
import { CaseSort, SortOption } from '@/components/cases/CaseSort';
import { get } from 'lodash';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: cases, isLoading, error } = useCasesList();
  const [currentSort, setCurrentSort] = useState<SortOption>({
    label: 'Title A-Z',
    value: 'title',
    direction: 'asc'
  });

  const sortedCases = useMemo(() => {
    if (!cases) return [];
    
    return [...cases].sort((a, b) => {
      const aValue = get(a, currentSort.value, '');
      const bValue = get(b, currentSort.value, '');
      
      if (currentSort.direction === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
  }, [cases, currentSort]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Environmental Policies</h1>
          <p className="text-slate-400">Active environmental policy cases</p>
        </div>
        {!isLoading && !error && cases && cases.length > 0 && (
          <div className="flex items-center gap-4">
            <CaseSort 
              currentSort={currentSort}
              onSort={setCurrentSort}
            />
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading cases...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4 rounded-lg bg-red-500/10 border border-red-500/20">
          Failed to load cases. Please try again later.
        </div>
      )}

      {!isLoading && !error && (!cases || cases.length === 0) && (
        <div className="text-center py-8">
          <p className="text-slate-400">No policy cases found</p>
        </div>
      )}

      {!isLoading && !error && cases && cases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCases.map((caseData) => (
            <CaseCard 
              key={caseData.id} 
              caseData={caseData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
