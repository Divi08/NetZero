import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowRight, Calendar, Clock, Trash2, X, FileText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCaseHistory, formatVisitTimestamp, groupVisitedCasesByDate, deleteHistoryItem, clearAllHistory, VisitedCase } from "@/services/historyService";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from '@/contexts/UserContext';

const History = () => {
  const [visitedCases, setVisitedCases] = useState<VisitedCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useUser();

  // Load history when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadHistory();
    } else if (!isUserLoading) {
      // If user is not loading and still null, we know they're not authenticated
      setIsLoading(false);
      setIsEmpty(true);
    }
    
    // Add visibility change listener to reload data when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadHistory(false); // Silent refresh
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up a periodic refresh every 30 seconds if the component is mounted
    const refreshInterval = setInterval(() => {
      if (user) {
        loadHistory(false); // silent refresh (don't show loading indicator)
      }
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, [user, isUserLoading]);

  const loadHistory = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      const history = await getCaseHistory(30); // Increase limit to 30 items
      
      // Check if there are any new items compared to current state
      const hasNewItems = history.length !== visitedCases.length || 
        history.some(item => !visitedCases.find(existing => 
          existing.id === item.id && 
          existing.timestamp?.seconds === item.timestamp?.seconds
        ));
      
      if (hasNewItems && visitedCases.length > 0 && !showLoading) {
        toast.info("History updated with recent activity");
      }
      
      setVisitedCases(history);
      setIsEmpty(history.length === 0);
    } catch (error) {
      console.error("Error loading history:", error);
      if (showLoading) {
        toast.error("Failed to load history");
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleCaseClick = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const handleClearItem = async (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent case click
    
    try {
      await deleteHistoryItem(caseId);
      // Update local state to remove the item immediately
      setVisitedCases(prev => prev.filter(item => item.id !== caseId));
      toast.success("Item removed from history");
      
      // Check if we removed the last item
      if (visitedCases.length === 1) {
        setIsEmpty(true);
      }
    } catch (error) {
      console.error("Error clearing history item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    
    try {
      await clearAllHistory();
      setVisitedCases([]);
      setIsEmpty(true);
      toast.success("History cleared");
    } catch (error) {
      console.error("Error clearing all history:", error);
      toast.error("Failed to clear history");
    } finally {
      setIsClearing(false);
    }
  };

  // Group cases by date
  const groupedCases = groupVisitedCasesByDate(visitedCases);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        </main>
      </div>
    );
  }

  const renderEmptyState = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">Sign In to View History</h3>
            <p className="text-muted-foreground max-w-sm">
              You need to sign in to track and view your case history.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-3">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">No Case History Yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Start exploring cases to build your history. Each case you view will be saved here.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/cases">Browse Cases</Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">History</h1>
              <p className="mt-2 text-muted-foreground">
                Your recently visited cases and investigations
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isLoading && !isEmpty && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadHistory()}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Refresh
                </Button>
              )}
              
              {!isEmpty && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear History</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to clear your entire browsing history? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearAll}
                        disabled={isClearing}
                      >
                        {isClearing ? <Spinner size="sm" className="mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </header>
          
          {isEmpty ? renderEmptyState() : (
            <div className="space-y-8">
              {Object.entries(groupedCases).map(([date, cases]) => (
                <div key={date} className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-medium">{date}</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {cases.map((caseItem) => (
                      <div 
                        key={caseItem.id} 
                        onClick={() => handleCaseClick(caseItem.id)}
                        className="block relative group cursor-pointer"
                      >
                        <div className="p-4 rounded-lg border hover:bg-card/50 transition-colors flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="inline-block">
                                <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-1 text-xs font-medium">
                                  {caseItem.category || 'Uncategorized'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatVisitTimestamp(caseItem.timestamp)}</span>
                              </div>
                            </div>
                            <h3 className="mt-1 font-medium">{caseItem.title || 'Unknown Case'}</h3>
                            {caseItem.caseData?.summary && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {caseItem.caseData.summary}
                              </p>
                            )}
                            {caseItem.caseData?.facility && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {caseItem.caseData.facility.FAC_NAME || 'Unknown Facility'}, 
                                {caseItem.caseData.facility.FAC_CITY || 'N/A'}, 
                                {caseItem.caseData.facility.FAC_STATE || 'N/A'}
                              </div>
                            )}
                            {caseItem.caseData?.status && (
                              <div className="text-xs mt-1">
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                  {caseItem.caseData.status}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleClearItem(caseItem.id, e)}
                              className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                              title="Remove from history"
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;

