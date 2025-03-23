import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, UserPlus, CheckCircle2 } from 'lucide-react';
import { fetchCaseById, PolicyCase, hardcodedCases } from '@/services/caseService';
import { trackCaseVisit } from '@/services/historyService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { CommunityChat } from '@/components/case/CommunityChat';
import { useCaseCommunityMessages } from '@/services/caseService';
import { hasUserJoinedCase, updateCaseJoinedStats } from '@/services/badgeService';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';

// Add interface for community message
interface CommunityMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userPhotoURL?: string | null;
  timestamp: Timestamp;
  isBot?: boolean;
}

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<PolicyCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
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

  // Check if user has joined this case
  useEffect(() => {
    async function checkJoinStatus() {
      if (id) {
        try {
          const joined = await hasUserJoinedCase(id);
          setHasJoined(joined);
        } catch (err) {
          console.error("Error checking join status:", err);
        }
      }
    }

    checkJoinStatus();
  }, [id]);

  const goBack = () => navigate(-1);

  const handleJoinCase = async () => {
    if (!id) return;
    
    setIsJoining(true);
    try {
      await updateCaseJoinedStats(id);
      setHasJoined(true);
      toast.success("You've joined this case!");
    } catch (err) {
      console.error("Error joining case:", err);
      toast.error("Failed to join case. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

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
        
        {/* Join Case Button */}
        {!hasJoined ? (
          <Button 
            onClick={handleJoinCase} 
            className="flex items-center gap-2"
            disabled={isJoining}
          >
            {isJoining ? <Spinner size="sm" className="mr-2" /> : <UserPlus className="h-4 w-4" />}
            Join Case
          </Button>
        ) : (
          <Button variant="outline" className="flex items-center gap-2" disabled>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Joined
          </Button>
        )}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Summary and KPIs */}
            <div className="lg:col-span-1 space-y-6">
              {/* Key metrics card */}
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary/20 p-1.5 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                    </svg>
                  </span>
                  Key Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border/40 rounded-lg p-3 bg-background/50">
                    <div className="text-sm text-muted-foreground">Regulation Type</div>
                    <div className="text-lg font-medium mt-1">{caseData.category || 'General'}</div>
                  </div>
                  <div className="border border-border/40 rounded-lg p-3 bg-background/50">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className={`text-lg font-medium mt-1 ${
                      caseData.status === 'In force' ? 'text-green-400' : 
                      caseData.status === 'Pending' ? 'text-yellow-400' : 
                      caseData.status === 'Ended' ? 'text-red-400' : 'text-blue-400'
                    }`}>{caseData.status}</div>
                  </div>
                  <div className="border border-border/40 rounded-lg p-3 bg-background/50">
                    <div className="text-sm text-muted-foreground">Start Date</div>
                    <div className="text-lg font-medium mt-1">{caseData.startDate ? new Date(caseData.startDate).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="border border-border/40 rounded-lg p-3 bg-background/50">
                    <div className="text-sm text-muted-foreground">Environmental Impact</div>
                    <div className="text-lg font-medium mt-1 flex items-center">
                      {caseData.impact ? (
                        <><span className="text-green-400">Positive</span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 15 7-7 7 7" /></svg></>
                      ) : (
                        <><span className="text-amber-400">Neutral</span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12h8" /></svg></>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Location card */}
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary/20 p-1.5 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  Location
                </h3>
                <div className="border border-border/40 rounded-lg p-4 bg-background/50">
                  <div className="flex flex-col space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Facility:</span>
                      <span className="ml-2 font-medium">{caseData.facility?.FAC_NAME || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">City:</span>
                      <span className="ml-2 font-medium">{caseData.facility?.FAC_CITY || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">State/Province:</span>
                      <span className="ml-2 font-medium">{caseData.facility?.FAC_STATE || 'N/A'}</span>
                    </div>
                    {caseData.facility?.REGISTRY_ID && (
                      <div>
                        <span className="text-sm text-muted-foreground">Registry ID:</span>
                        <span className="ml-2 font-medium">{caseData.facility.REGISTRY_ID}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 h-[120px] bg-slate-800/50 rounded-md flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Map view would be displayed here</span>
                  </div>
                </div>
              </div>
              
              {/* Time period visualization */}
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary/20 p-1.5 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  Timeline
                </h3>
                <div className="border border-border/40 rounded-lg p-4 bg-background/50">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-900 text-blue-300">
                          Policy Lifecycle
                        </span>
                      </div>
                      {caseData.endDate ? (
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-900 text-red-300">
                            Ended
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-900 text-green-300">
                            Active
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-700">
                      <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold block">Start</span>
                        <span>{caseData.startDate ? new Date(caseData.startDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold block">Current</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold block">End</span>
                        <span>{caseData.endDate ? new Date(caseData.endDate).toLocaleDateString() : 'Ongoing'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Analysis content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary/20 p-1.5 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </span>
                  Expert Analysis
                </h3>
                <div className="prose prose-invert max-w-none">
                  {caseData.aiAnalysis ? (
                    <div className="whitespace-pre-line space-y-4">
                      {caseData.aiAnalysis.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p>No AI analysis available for this case.</p>
                  )}
                </div>
              </div>
              
              {/* Policy objectives */}
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary/20 p-1.5 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                      <path d="M8.5 8.5v.01" />
                      <path d="M16 15.5v.01" />
                      <path d="M12 12v.01" />
                      <path d="M11 17v.01" />
                      <path d="M7 14v.01" />
                    </svg>
                  </span>
                  Policy Objectives
                </h3>
                <div className="border border-border/40 rounded-lg p-4 bg-background/50">
                  <div className="flex items-center mb-4">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      caseData.objectives === 'Mitigation' ? 'bg-blue-400' :
                      caseData.objectives === 'Prevention' ? 'bg-green-400' :
                      caseData.objectives === 'Adaptation' ? 'bg-purple-400' : 'bg-amber-400'
                    }`}></div>
                    <span className="font-medium">{caseData.objectives || 'General Objectives'}</span>
                  </div>
                  <div className="space-y-3">
                    {caseData.objectives === 'Mitigation' && (
                      <>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Reduce greenhouse gas emissions</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Promote clean energy alternatives</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Establish carbon tracking mechanisms</span>
                        </div>
                      </>
                    )}
                    {caseData.objectives === 'Prevention' && (
                      <>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Prevent environmental contamination</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Establish safety protocols</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Protect ecosystems and biodiversity</span>
                        </div>
                      </>
                    )}
                    {!['Mitigation', 'Prevention'].includes(caseData.objectives || '') && (
                      <>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Address climate change impacts</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Promote sustainable practices</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m22 12-4-4v3H3v2h15v3l4-4z" />
                          </svg>
                          <span>Support environmental conservation</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Implementation Challenges */}
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary/20 p-1.5 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  </span>
                  Implementation Challenges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-orange-500/20 bg-orange-950/10 rounded-lg p-4">
                    <h4 className="font-medium text-orange-400 mb-2">Economic Impact</h4>
                    <p className="text-sm">Potential costs for businesses adapting to new regulations and competitive implications in global markets.</p>
                  </div>
                  <div className="border border-purple-500/20 bg-purple-950/10 rounded-lg p-4">
                    <h4 className="font-medium text-purple-400 mb-2">Technical Feasibility</h4>
                    <p className="text-sm">Challenges in implementation due to technological limitations or measurement difficulties.</p>
                  </div>
                  <div className="border border-blue-500/20 bg-blue-950/10 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2">Compliance Verification</h4>
                    <p className="text-sm">Methods for monitoring adherence to policy requirements and ensuring accurate reporting.</p>
                  </div>
                  <div className="border border-green-500/20 bg-green-950/10 rounded-lg p-4">
                    <h4 className="font-medium text-green-400 mb-2">Stakeholder Support</h4>
                    <p className="text-sm">Varying levels of acceptance from industry, public, and other governmental entities.</p>
                  </div>
                </div>
              </div>
              
              {/* Related Resources */}
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-primary/20 p-1.5 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <path d="M13 2v7h7" />
                    </svg>
                  </span>
                  Related Resources
                </h3>
                <div className="space-y-3">
                  <div className="border border-border/40 hover:border-primary/50 transition-colors rounded-lg p-4 bg-background/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                        <div>
                          <h4 className="font-medium">Official Documentation</h4>
                          <p className="text-sm text-muted-foreground">Full text of the policy with amendments</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </div>
                  </div>
                  <div className="border border-border/40 hover:border-primary/50 transition-colors rounded-lg p-4 bg-background/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <div>
                          <h4 className="font-medium">Impact Assessment</h4>
                          <p className="text-sm text-muted-foreground">Environmental impact study results</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </div>
                  </div>
                  <div className="border border-border/40 hover:border-primary/50 transition-colors rounded-lg p-4 bg-background/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <div>
                          <h4 className="font-medium">Compliance Support</h4>
                          <p className="text-sm text-muted-foreground">Assistance for affected entities</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" className="text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Find more resources
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="community" className="mt-0">
          {!hasJoined ? (
            <div className="border rounded-lg p-8 bg-card flex flex-col items-center justify-center text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Join to participate in the discussion</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You need to join this case to actively participate in the community discussion.
                Join to share your insights and collaborate with others.
              </p>
              <Button onClick={handleJoinCase} disabled={isJoining}>
                {isJoining ? <Spinner size="sm" className="mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Join Case
              </Button>
              
              {communityMessages.length > 0 && (
                <div className="mt-8 border-t pt-8 w-full">
                  <h4 className="text-lg font-medium mb-4">Current Discussion</h4>
                  <div className="space-y-4 opacity-75">
                    {communityMessages.map((msg: any, index: number) => {
                      // Only show first 5 messages
                      if (index >= 5) return null;
                      return (
                        <div key={msg.id} className="p-3 border rounded-lg bg-background/50">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm">
                              {msg.userName ? msg.userName.substring(0, 1) : '?'}
                            </div>
                            <span className="font-medium">{msg.userName || 'Anonymous'}</span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp && msg.timestamp.toDate ? 
                                new Date(msg.timestamp.toDate()).toLocaleString() : 
                                'Unknown time'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.content}</p>
                        </div>
                      );
                    })}
                    {communityMessages.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        {communityMessages.length - 5} more messages in this discussion...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CommunityChat caseId={id || ''} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

