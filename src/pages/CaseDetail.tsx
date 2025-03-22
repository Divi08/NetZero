import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Share2,
  Flag,
  FileText,
  BarChart,
  Loader2
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { fetchECHOFacilities } from '@/services/echoService';
import { generateCaseFromFacility, GeneratedCase } from '@/services/geminiService';

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<GeneratedCase | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCase() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all facilities and find the matching one
        const facilities = await fetchECHOFacilities();
        const facility = facilities.find(f => f.REGISTRY_ID === id);

        if (!facility) {
          setError('Case not found');
          return;
        }

        // Generate case data from the facility
        const generatedCase = await generateCaseFromFacility(facility);
        
        if (mounted) {
          setCaseData(generatedCase);
        }
      } catch (err) {
        console.error('Error loading case:', err);
        if (mounted) {
          setError('Failed to load case details');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadCase();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
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
            <p className="text-red-500">{error || 'Case not found'}</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Calculate metrics based on violations
  const urgencyLevel = caseData.facility.VIOLATIONS.length * 25; // Simple calculation, adjust as needed
  const progress = 10; // Default starting progress
  const participants = 1; // Default number of participants

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header Section */}
        <header className="border-b py-4 px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back to cases</span>
                </div>
              </Link>
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <span className="text-sm text-muted-foreground">{caseData.category}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="destructive" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{caseData.title}</h1>
          
          {/* Case Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Urgency Level</div>
              <Progress value={urgencyLevel} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {urgencyLevel >= 75 ? 'High Priority' : urgencyLevel >= 50 ? 'Medium Priority' : 'Low Priority'}
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Progress</div>
              <Progress value={progress} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">Just Started</div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Participants</div>
              <div className="flex items-center gap-2 mt-2">
                <Users className="h-4 w-4" />
                <span className="text-lg font-semibold">{participants}</span>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Status</div>
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Active</span>
              </div>
            </div>
          </div>
          
          {/* Location and Date */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{caseData.facility.FAC_CITY}, {caseData.facility.FAC_STATE}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last Inspection: {new Date(caseData.facility.DERIVED_LAST_INSPECTION_DATE).toLocaleDateString()}</span>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-[2fr,1fr]">
          <div className="border-r overflow-y-auto">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start px-4 border-b">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="violations">Violations</TabsTrigger>
                <TabsTrigger value="facility">Facility Info</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-6">
                <p className="text-sm text-card-foreground/80 leading-relaxed">
                  {caseData.summary}
                </p>
              </TabsContent>
              
              <TabsContent value="violations" className="p-6">
                <div className="space-y-4">
                  {caseData.facility.VIOLATIONS.map((violation, index) => (
                    <div key={index} className="rounded-lg border bg-card p-4 shadow-sm">
                      <h4 className="font-medium mb-2">{violation.STATUTE} Violation</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Type: {violation.VIOLATION_TYPE_CODE}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(violation.VIOLATION_DATE).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="facility" className="p-6">
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <h4 className="font-medium mb-4">Facility Information</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Name:</span> {caseData.facility.FAC_NAME}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Location:</span> {caseData.facility.FAC_CITY}, {caseData.facility.FAC_STATE} {caseData.facility.FAC_ZIP}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Status:</span> {caseData.facility.FAC_ACTIVE_FLAG === 'Y' ? 'Active' : 'Inactive'}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Registry ID:</span> {caseData.facility.REGISTRY_ID}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="p-6">
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <h4 className="font-medium mb-4">AI Analysis</h4>
                    <p className="text-sm text-card-foreground/80 leading-relaxed">
                      Based on the facility's violation history and compliance status, this case represents a significant environmental concern that requires attention.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="overflow-hidden flex flex-col">
            <ChatInterface caseId={caseData.id} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetail;

