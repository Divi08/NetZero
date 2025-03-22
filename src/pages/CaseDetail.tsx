
<<<<<<< HEAD
import { useParams, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ArrowLeft, Users, Calendar, MapPin, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
=======
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  BarChart
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface CaseDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  dateReported: string;
  status: string;
  participants: number;
  urgencyLevel: number;
  progress: number;
  evidence: Evidence[];
  relatedPolicies: Policy[];
  aiInsights: string[];
}

interface Evidence {
  id: string;
  title: string;
  type: string;
  description: string;
  dateAdded: string;
  imageUrl?: string;
}

interface Policy {
  id: string;
  title: string;
  relevance: string;
  link: string;
}
>>>>>>> 6c63f50 (sign in)

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
<<<<<<< HEAD
  
  // This would be fetched from an API in a real application
  const caseDetails = {
    id: id || "unknown",
    title: "Methane Leaks in Natural Gas Infrastructure",
    description: "Satellite imagery has detected anomalous methane emissions in a major natural gas pipeline network. Data shows consistent leakage patterns over the past three months, with emission rates far exceeding regulatory limits. These leaks are contributing significantly to short-term climate forcing effects. Local temperature records show unusual warming patterns that correlate with the detected emissions.",
=======
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock data - would be fetched from API
  const caseDetails: CaseDetails = {
    id: id || "unknown",
    title: "Methane Leaks in Natural Gas Infrastructure",
    description: "Satellite imagery has detected anomalous methane emissions in a major natural gas pipeline network. Data shows consistent leakage patterns over the past three months, with emission rates far exceeding regulatory limits.",
>>>>>>> 6c63f50 (sign in)
    category: "Greenhouse Gas Emissions",
    location: "Northern Colorado Gas Basin",
    dateReported: "May 15, 2023",
    status: "Active",
    participants: 12,
<<<<<<< HEAD
=======
    urgencyLevel: 85,
    progress: 65,
    evidence: [
      {
        id: "1",
        title: "Satellite Methane Detection",
        type: "image",
        description: "Shows patterns of methane dispersal from pipeline infrastructure",
        dateAdded: "2023-05-15",
        imageUrl: "/mock-satellite-image.jpg"
      },
      {
        id: "2",
        title: "Emissions Data Analysis",
        type: "document",
        description: "Quantitative analysis confirms greenhouse gas emission rates",
        dateAdded: "2023-05-16"
      }
    ],
    relatedPolicies: [
      {
        id: "1",
        title: "EPA Methane Emissions Standards",
        relevance: "Direct violation of Section 3.2",
        link: "https://epa.gov/standards"
      }
    ],
    aiInsights: [
      "Emission patterns suggest systematic infrastructure failure rather than isolated incidents",
      "Local temperature anomalies correlate strongly with leak locations",
      "Similar cases in other regions led to successful regulatory action"
    ]
>>>>>>> 6c63f50 (sign in)
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden flex flex-col">
<<<<<<< HEAD
        <header className="border-b py-4 px-6">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <div className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to cases</span>
              </div>
            </Link>
            <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
            <span className="text-sm text-muted-foreground">{caseDetails.category}</span>
          </div>
          
          <h1 className="text-2xl font-bold">{caseDetails.title}</h1>
          
          <div className="flex flex-wrap gap-4 mt-4">
=======
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
              <span className="text-sm text-muted-foreground">{caseDetails.category}</span>
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
          
          <h1 className="text-2xl font-bold mb-2">{caseDetails.title}</h1>
          
          {/* Case Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Urgency Level</div>
              <Progress value={caseDetails.urgencyLevel} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">High Priority</div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Progress</div>
              <Progress value={caseDetails.progress} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">On Track</div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Participants</div>
              <div className="flex items-center gap-2 mt-2">
                <Users className="h-4 w-4" />
                <span className="text-lg font-semibold">{caseDetails.participants}</span>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted">
              <div className="text-sm font-medium">Status</div>
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">{caseDetails.status}</span>
              </div>
            </div>
          </div>
          
          {/* Location and Date */}
          <div className="flex flex-wrap gap-4">
>>>>>>> 6c63f50 (sign in)
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{caseDetails.location}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Reported: {caseDetails.dateReported}</span>
            </div>
<<<<<<< HEAD
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{caseDetails.participants} participants</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">{caseDetails.status}</span>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden grid grid-cols-[2fr,1fr]">
          <div className="border-r overflow-y-auto">
            <Collapsible
              open={!detailsCollapsed}
              onOpenChange={(open) => setDetailsCollapsed(!open)}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Case Details</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {detailsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent>
                <div className="p-6">
                  <p className="text-sm text-card-foreground/80 leading-relaxed">
                    {caseDetails.description}
                  </p>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3">Evidence</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <h4 className="font-medium mb-2">Satellite Methane Detection</h4>
                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Methane emissions imagery</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Shows patterns of methane dispersal from pipeline infrastructure
                        </p>
                      </div>
                      
                      <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <h4 className="font-medium mb-2">Emissions Data</h4>
                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Emissions analysis</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Quantitative analysis confirms greenhouse gas emission rates
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
=======
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-[2fr,1fr]">
          <div className="border-r overflow-y-auto">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start px-4 border-b">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="policies">Related Policies</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-6">
                <p className="text-sm text-card-foreground/80 leading-relaxed">
                  {caseDetails.description}
                </p>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
                  <div className="space-y-4">
                    {caseDetails.aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                        <BarChart className="h-5 w-5 text-primary mt-0.5" />
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="evidence" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseDetails.evidence.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-card p-4 shadow-sm">
                      <h4 className="font-medium mb-2">{item.title}</h4>
                      {item.imageUrl ? (
                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">{item.type}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">View Document</span>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Added: {item.dateAdded}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="policies" className="p-6">
                <div className="space-y-4">
                  {caseDetails.relatedPolicies.map((policy) => (
                    <div key={policy.id} className="rounded-lg border bg-card p-4 shadow-sm">
                      <h4 className="font-medium mb-2">{policy.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Relevance: {policy.relevance}
                      </p>
                      <a 
                        href={policy.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Policy Document
                      </a>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="p-6">
                {/* AI Analysis content */}
              </TabsContent>
            </Tabs>
>>>>>>> 6c63f50 (sign in)
          </div>
          
          <div className="overflow-hidden flex flex-col">
            <ChatInterface caseId={caseDetails.id} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetail;
<<<<<<< HEAD
=======

>>>>>>> 6c63f50 (sign in)
