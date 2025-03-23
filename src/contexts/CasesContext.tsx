import { createContext, useContext, ReactNode, useState } from 'react';
import { PolicyCase } from '@/services/caseService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface CasesContextType {
  cases: PolicyCase[];
  setCases: (cases: PolicyCase[]) => void;
}

const CasesContext = createContext<CasesContextType>({
  cases: [],
  setCases: () => {},
});

const queryClient = new QueryClient();

export function CasesProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<PolicyCase[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <CasesContext.Provider value={{ cases, setCases }}>
        {children}
      </CasesContext.Provider>
    </QueryClientProvider>
  );
}

export const useCases = () => useContext(CasesContext); 