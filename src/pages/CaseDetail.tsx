import { useParams, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Building2,
  Calendar,
  MapPin,
  BadgeAlert,
  Lightbulb,
  UserCircle2,
  Users,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCase, generateAIAnalysis } from '@/services/caseService';
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: caseData, isLoading, error } = useCase(id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Format the dates for better display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get impact level styling
  const getImpactStyle = () => {
    if (caseData.impact !== undefined) {
      return {
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/20",
        label: "High Impact"
      };
    }
    return {
      color: "text-yellow-500",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "Moderate Impact"
    };
  };

  const impactStyle = getImpactStyle();

  // Get status styling
  const getStatusStyle = (status: string | undefined) => {
    if (!status) {
      return {
        color: "text-slate-500",
        bg: "bg-slate-100 dark:bg-slate-900/20"
      };
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return {
          color: "text-green-500",
          bg: "bg-green-100 dark:bg-green-900/20"
        };
      case 'pending':
        return {
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-900/20"
        };
      case 'closed':
        return {
          color: "text-slate-500",
          bg: "bg-slate-100 dark:bg-slate-900/20"
        };
      default:
        return {
          color: "text-slate-500",
          bg: "bg-slate-100 dark:bg-slate-900/20"
        };
    }
  };

  const statusStyle = getStatusStyle(caseData.status);

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="mb-6">
            <Link to="/cases" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Link>
            
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{caseData.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="flex items-center gap-1 font-normal">
                    <Building2 className="h-3 w-3" /> 
                    {caseData.facility?.FAC_NAME || 'Unknown Facility'}
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1 font-normal">
                    <MapPin className="h-3 w-3" /> 
                    {caseData.facility?.FAC_CITY || 'N/A'}, {caseData.facility?.FAC_STATE || 'N/A'}
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1 font-normal">
                    <Calendar className="h-3 w-3" /> 
                    {formatDate(caseData.startDate)}
                  </Badge>
                  
                  <Badge className={`${statusStyle.bg} ${statusStyle.color}`}>
                    {caseData.status || 'Unknown Status'}
                  </Badge>
                  
                  <Badge className={`${impactStyle.bg} ${impactStyle.color}`}>
                    {impactStyle.label}
                  </Badge>
                </div>
              </div>
              
              {!caseData.aiAnalysis && !isGenerating && (
                <Button 
                  onClick={handleGenerateAnalysis}
                  disabled={isGenerating}
                  className="whitespace-nowrap"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate AI Analysis
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!caseData.aiAnalysis && !isGenerating}>
                AI Analysis {!caseData.aiAnalysis && !isGenerating && "(Generate First)"}
              </TabsTrigger>
              <TabsTrigger value="details">Facility Details</TabsTrigger>
              <TabsTrigger value="community">Community Solutions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                    Case Summary
                  </CardTitle>
                  <CardDescription>
                    Key information about this environmental policy case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">{caseData.summary}</p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{caseData.category}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span>Start: {formatDate(caseData.startDate)}</span>
                      <span>End: {formatDate(caseData.endDate)}</span>
                    </div>
                    <Progress 
                      value={75} 
                      className="h-2 mt-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Key Objectives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{caseData.objectives}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BadgeAlert className="mr-2 h-5 w-5 text-primary" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground">
                      This case has been classified as having a <span className={impactStyle.color}>{impactStyle.label}</span> on 
                      the environment. The impact assessment takes into account factors such as geographic scope, 
                      affected population, ecosystem damage, and long-term consequences.
                    </p>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Key Environmental Concerns</h4>
                        <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                          <li>Air quality degradation from industrial emissions</li>
                          <li>Potential groundwater contamination</li>
                          <li>Impact on local biodiversity and ecosystems</li>
                          <li>Community health implications</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Regulatory Considerations</h4>
                        <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                          <li>Clean Air Act compliance review</li>
                          <li>Water quality monitoring requirements</li>
                          <li>Environmental impact assessment reports</li>
                          <li>Remediation plan development</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {isGenerating ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Generating AI Analysis</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          This may take a minute or two...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : caseData.aiAnalysis ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                        AI Policy Analysis
                      </CardTitle>
                      <CardDescription>
                        Comprehensive analysis of the policy implications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed">{caseData.aiAnalysis}</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Core Policy Issues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <span className="h-3 w-3 rounded-full bg-primary"></span>
                            </div>
                            <div className="text-sm">Regulatory compliance with emissions standards</div>
                          </li>
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <span className="h-3 w-3 rounded-full bg-primary"></span>
                            </div>
                            <div className="text-sm">Balancing economic interests with environmental protection</div>
                          </li>
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <span className="h-3 w-3 rounded-full bg-primary"></span>
                            </div>
                            <div className="text-sm">Community impact assessment and stakeholder engagement</div>
                          </li>
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <span className="h-3 w-3 rounded-full bg-primary"></span>
                            </div>
                            <div className="text-sm">Long-term environmental monitoring and enforcement</div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                              <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            </div>
                            <div className="text-sm">Implement stricter emissions monitoring protocols</div>
                          </li>
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                              <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            </div>
                            <div className="text-sm">Establish community feedback mechanisms</div>
                          </li>
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                              <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            </div>
                            <div className="text-sm">Create incentives for adopting cleaner technologies</div>
                          </li>
                          <li className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                              <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            </div>
                            <div className="text-sm">Develop comprehensive remediation plans</div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <RefreshCw className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <h3 className="text-lg font-medium">AI Analysis Not Available</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Click the "Generate AI Analysis" button to create an analysis of this case.
                        </p>
                        {analysisError && (
                          <p className="text-sm text-red-500 mt-2">{analysisError}</p>
                        )}
                      </div>
                      <Button 
                        onClick={handleGenerateAnalysis}
                        disabled={isGenerating}
                      >
                        Generate Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                    Facility Information
                  </CardTitle>
                  <CardDescription>
                    Detailed information about the facility involved in this case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Basic Information</h3>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium">Facility Name</dt>
                          <dd className="mt-1">{caseData.facility?.FAC_NAME || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium">Registry ID</dt>
                          <dd className="mt-1">{caseData.facility?.REGISTRY_ID || 'N/A'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium">Location</dt>
                          <dd className="mt-1">
                            {caseData.facility ? `${caseData.facility.FAC_CITY || 'N/A'}, ${caseData.facility.FAC_STATE || 'N/A'}` : 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Compliance History</h3>
                      {caseData.facility?.VIOLATIONS && caseData.facility.VIOLATIONS.length > 0 ? (
                        <div className="space-y-2">
                          {caseData.facility.VIOLATIONS.map((violation, index) => (
                            <div key={index} className="rounded border p-2 text-sm">
                              {violation}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No violation history available for this facility.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Case Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-muted-foreground/20 pl-6 ml-3">
                    <div className="mb-10 relative">
                      <div className="absolute w-4 h-4 bg-primary rounded-full -left-8 border-4 border-background"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                        {formatDate(caseData.startDate)}
                      </time>
                      <h3 className="text-lg font-semibold">Case Initiated</h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Environmental policy case was opened following initial assessment.
                      </p>
                    </div>
                    
                    <div className="mb-10 relative">
                      <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-8 border-4 border-background"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                        {formatDate(new Date().toISOString())}
                      </time>
                      <h3 className="text-lg font-semibold">Current Status: {caseData.status}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ongoing assessment and policy development. Community stakeholders engaged.
                      </p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute w-4 h-4 bg-muted-foreground/30 rounded-full -left-8 border-4 border-background"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">
                        {formatDate(caseData.endDate)}
                      </time>
                      <h3 className="text-lg font-semibold">Expected Resolution</h3>
                      <p className="text-sm text-muted-foreground">
                        Targeted resolution date pending implementation of policy recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Community Discussion & Solutions
                  </CardTitle>
                  <CardDescription>
                    Join the community discussion to propose and refine solutions for this environmental policy case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium">Problem Statement</h3>
                      <p className="text-muted-foreground mt-2">
                        The {caseData.facility?.FAC_NAME || 'unnamed'} facility in {caseData.facility?.FAC_CITY || 'unknown location'}, {caseData.facility?.FAC_STATE || ''} 
                        has been identified as contributing to environmental concerns including air quality, water safety, and 
                        community health impacts. The challenge is to develop a policy framework that ensures environmental 
                        protection while considering economic factors and stakeholder interests.
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium">Proposed Solutions</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Join the discussion by proposing your solutions to this environmental policy case
                      </p>

                      <Button className="w-full mb-6">
                        + Add Your Solution
                      </Button>

                      <div className="space-y-6">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">Jane Doe</div>
                              <div className="text-xs text-muted-foreground">Environmental Policy Expert</div>
                            </div>
                          </div>
                          <h4 className="font-medium">Integrated Monitoring & Community Oversight</h4>
                          <p className="text-sm text-muted-foreground mt-2">
                            I propose implementing a community oversight board with access to real-time emission monitoring data. 
                            This approach has proven successful in similar cases in Colorado where it increased compliance by 46% 
                            and reduced incidents by 62%. The key is transparent data sharing and regular community feedback sessions.
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Badge variant="outline">Monitoring</Badge>
                            <Badge variant="outline">Community Engagement</Badge>
                            <Badge variant="outline">Transparency</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                            <span>2 days ago</span>
                            <div className="flex gap-4">
                              <span className="flex items-center gap-1">
                                <UserCircle2 className="h-4 w-4" /> 12 supporters
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" /> 4 comments
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarFallback>MS</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">Michael Smith</div>
                              <div className="text-xs text-muted-foreground">Environmental Engineer</div>
                            </div>
                          </div>
                          <h4 className="font-medium">Technology-Based Phased Compliance</h4>
                          <p className="text-sm text-muted-foreground mt-2">
                            Rather than immediate strict standards, I recommend a phased approach with clear technological 
                            milestones. This gives the facility time to implement changes while ensuring steady progress. 
                            Each phase would have mandatory reporting requirements and financial incentives for early adoption.
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Badge variant="outline">Technology</Badge>
                            <Badge variant="outline">Phased Implementation</Badge>
                            <Badge variant="outline">Incentives</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                            <span>1 week ago</span>
                            <div className="flex gap-4">
                              <span className="flex items-center gap-1">
                                <UserCircle2 className="h-4 w-4" /> 8 supporters
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" /> 6 comments
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CaseDetail;

