import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { fetchCaseById, PolicyCase, hardcodedCases } from '@/services/caseService';
import { trackCaseVisit } from '@/services/historyService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { CommunityChat } from '@/components/case/CommunityChat';
import { useCaseCommunityMessages } from '@/services/caseService';

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<PolicyCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: communityMessages = [] } = useCaseCommunityMessages(id || '');

  useEffect(() => {
    async function loadCase() {
      if (!id) {
        setError("Case ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First check if we have this case in hardcoded data
        const hardcodedCase = hardcodedCases.find(c => c.id === id);
        if (hardcodedCase) {
          console.log(`Using hardcoded data for case ${id}`);
          setCaseData(hardcodedCase);
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        console.log(`Fetching case ${id} from API`);
        const data = await fetchCaseById(id);
        setCaseData(data);
      } catch (err) {
        console.error("Error loading case:", err);
        setError("Failed to load case details");
      } finally {
        setIsLoading(false);
      }
    }

    loadCase();
  }, [id]);

  // Track case visit when case data is loaded
  useEffect(() => {
    if (id && caseData && !isLoading) {
      console.log('Tracking case visit:', id);
      
      // Ensure we're sending complete data to the history service
      const caseDataForHistory = {
        id: id,
        title: caseData.title,
        category: caseData.category || 'General',
        summary: caseData.summary,
        facility: caseData.facility,
        status: caseData.status,
        startDate: caseData.startDate,
        endDate: caseData.endDate,
        impact: caseData.impact,
        objectives: caseData.objectives,
        aiAnalysis: caseData.aiAnalysis
      };
      
      // Track the visit, which will update Firebase
      trackCaseVisit(id, caseDataForHistory)
        .catch(err => console.error('Error tracking case visit:', err));
    }
  }, [id, caseData, isLoading]);

  const goBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Case</h2>
        <p className="text-gray-300 mb-6">{error || "Case data not available"}</p>
        <Button onClick={goBack} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const formattedDate = caseData.startDate 
    ? new Date(caseData.startDate).toLocaleDateString()
    : 'Unknown date';

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        onClick={goBack}
        variant="ghost"
        className="flex items-center mb-6 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              {caseData.category || 'Uncategorized'}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> {formattedDate}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              caseData.status === 'In force' ? 'bg-green-500/10 text-green-400' : 
              caseData.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' : 
              'bg-primary/5 text-primary'
            }`}>
              {caseData.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mt-3">
            {caseData.title || `Case ${id}`}
          </h1>
          <p className="text-slate-400 mt-2 max-w-3xl">
            {caseData.summary || 'No summary available for this case.'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="analysis">
            Analysis
          </TabsTrigger>
          <TabsTrigger value="community">
            Community Discussion
            {communityMessages.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {communityMessages.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-0">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Case Analysis</h2>
            <div className="prose prose-invert max-w-none">
              {caseData.aiAnalysis ? (
                <p className="whitespace-pre-line">{caseData.aiAnalysis}</p>
              ) : (
                <p>No AI analysis available for this case.</p>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="community" className="mt-0">
          <CommunityChat caseId={id || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

