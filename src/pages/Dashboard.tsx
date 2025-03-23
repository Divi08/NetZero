import { useCasesList } from '@/services/caseService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loader2, AlertCircle, BarChart3, FileText, AlertTriangle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data, isLoading, error } = useCasesList();
  
  // Ensure cases is an array
  const cases = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-red-500">Failed to load dashboard data</p>
          </div>
        </main>
      </div>
    );
  }

  const totalCases = cases.length;
  const highImpactCases = cases.filter(c => c.impact).length;
  const pendingAnalysis = cases.filter(c => !c.aiAnalysis).length;
  const categoryCounts = cases.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Dashboard Overview</h1>
            <p className="text-slate-400">Summary of environmental policy cases and analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Cases</p>
                  <h3 className="text-2xl font-bold">{totalCases}</h3>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">High Impact Cases</p>
                  <h3 className="text-2xl font-bold">{highImpactCases}</h3>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Analysis</p>
                  <h3 className="text-2xl font-bold">{pendingAnalysis}</h3>
                </div>
              </div>
            </div>

            <Link 
              to="/cases" 
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-4">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">View All Cases</p>
                  <h3 className="text-2xl font-bold">→</h3>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Cases by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium text-muted-foreground">{category}</h3>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
