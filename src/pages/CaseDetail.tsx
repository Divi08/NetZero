
import { useParams, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ArrowLeft, Users, Calendar, MapPin, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  
  // This would be fetched from an API in a real application
  const caseDetails = {
    id: id || "unknown",
    title: "Methane Leaks in Natural Gas Infrastructure",
    description: "Satellite imagery has detected anomalous methane emissions in a major natural gas pipeline network. Data shows consistent leakage patterns over the past three months, with emission rates far exceeding regulatory limits. These leaks are contributing significantly to short-term climate forcing effects. Local temperature records show unusual warming patterns that correlate with the detected emissions.",
    category: "Greenhouse Gas Emissions",
    location: "Northern Colorado Gas Basin",
    dateReported: "May 15, 2023",
    status: "Active",
    participants: 12,
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden flex flex-col">
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
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{caseDetails.location}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Reported: {caseDetails.dateReported}</span>
            </div>
            
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
