import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowRight, Calendar, Clock, Trash2, X, FileText, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCaseHistory, formatVisitTimestamp, groupVisitedCasesByDate, deleteHistoryItem, clearAllHistory, VisitedCase } from "@/services/historyService";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUser } from '@/contexts/UserContext';
import { getUserJoinedCases } from "@/services/badgeService";

const History = () => {
  const [joinedCases, setJoinedCases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading } = useUser();

  // Load joined cases when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadJoinedCases();
    } else if (!isUserLoading) {
      // If user is not loading and still null, we know they're not authenticated
      setIsLoading(false);
      setIsEmpty(true);
    }
    
    // Set up a periodic refresh every 30 seconds if the component is mounted
    const refreshInterval = setInterval(() => {
      if (user) {
        loadJoinedCases(false); // silent refresh (don't show loading indicator)
      }
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [user, isUserLoading]);

  const loadJoinedCases = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      const cases = await getUserJoinedCases();
      
      setJoinedCases(cases);
      setIsEmpty(cases.length === 0);
    } catch (error) {
      console.error("Error loading joined cases:", error);
      if (showLoading) {
        toast.error("Failed to load joined cases");
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

  const renderEmptyState = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">Sign In to View Joined Cases</h3>
            <p className="text-muted-foreground max-w-sm">
              You need to sign in to view cases you've joined.
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
          <UserPlus className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">No Joined Cases Yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Start exploring and joining cases to build your collection. Each case you join will be saved here.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/cases">Browse Cases</Link>
          </Button>
        </div>
      </div>
    );
  };

  const renderCases = () => {
    if (isEmpty) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {joinedCases.map((caseId) => (
          <div 
            key={caseId} 
            onClick={() => handleCaseClick(caseId)}
            className="block relative group cursor-pointer"
          >
            <div className="p-4 rounded-lg border hover:bg-card/50 transition-colors flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-medium">Case {caseId}</h3>
                <p className="text-sm text-muted-foreground">
                  Click to view case details
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
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
              <h1 className="text-3xl font-bold tracking-tight">Joined Cases</h1>
              <p className="mt-2 text-muted-foreground">
                View and access the cases you've joined
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isLoading && !isEmpty && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadJoinedCases()}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Refresh
                </Button>
              )}
            </div>
          </header>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Spinner size="lg" />
                <p className="text-muted-foreground">Loading joined cases...</p>
              </div>
            </div>
          ) : (
            renderCases()
          )}
        </div>
      </main>
    </div>
  );
};

export default History;

