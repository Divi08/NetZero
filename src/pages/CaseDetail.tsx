import { useParams, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCase, generateAIAnalysis } from '@/services/caseService';
import { useState } from 'react';

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: caseData, isLoading, error } = useCase(id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleGenerateAnalysis = async () => {
    if (!id) return;
    setIsGenerating(true);
    setAnalysisError(null);
    try {
      await generateAIAnalysis(id);
      window.location.reload(); // Reload to get updated data
    } catch (err) {
      setAnalysisError('Failed to generate analysis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading case details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-red-500">Failed to load case details</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="mt-4 text-2xl font-bold">{caseData.title}</h1>
            {caseData.facility && (
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center">
                  {caseData.facility.FAC_CITY || 'N/A'}, {caseData.facility.FAC_STATE || 'N/A'}
                </span>
              </div>
            )}
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <p className="text-muted-foreground">{caseData.summary}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium mb-2">Status</h3>
                  <div className="text-2xl font-bold text-primary">{caseData.status}</div>
                </div>
                
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium mb-2">Category</h3>
                  <div className="text-2xl font-bold">{caseData.category}</div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium mb-2">Impact Level</h3>
                  <div className="text-2xl font-bold text-yellow-500">
                    {caseData.impact ? 'High Impact' : 'Standard'}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">AI Analysis</h2>
                  {!caseData.aiAnalysis && !isGenerating && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerateAnalysis}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      Generate Analysis
                    </Button>
                  )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {isGenerating ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating analysis...
                    </div>
                  ) : caseData.aiAnalysis ? (
                    <div className="whitespace-pre-wrap">{caseData.aiAnalysis}</div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Analysis not available. Click the button above to generate an AI analysis of this case.
                      </p>
                      {analysisError && (
                        <p className="text-red-500 text-sm">{analysisError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h2 className="text-xl font-semibold mb-4">Facility Information</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Facility Name</dt>
                    <dd className="mt-1 text-sm">{caseData.facility?.FAC_NAME || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Registry ID</dt>
                    <dd className="mt-1 text-sm">{caseData.facility?.REGISTRY_ID || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                    <dd className="mt-1 text-sm">
                      {caseData.facility ? `${caseData.facility.FAC_CITY || 'N/A'}, ${caseData.facility.FAC_STATE || 'N/A'}` : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Objectives</dt>
                    <dd className="mt-1 text-sm">{caseData.objectives || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CaseDetail;

