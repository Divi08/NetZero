import { Link } from "react-router-dom";
import { ArrowRight, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PolicyCase as ServicePolicyCase } from "@/services/caseService";

interface PolicyCase {
  id: string;
  title: string;
  category: string;
  summary: string;
  facility: {
    FAC_NAME: string;
    FAC_CITY: string;
    FAC_STATE: string;
  };
  status: string;
  startDate: string;
  endDate: string;
  impact: boolean;
  objectives: string;
  aiAnalysis?: string;
}

interface CaseCardProps {
  caseData?: PolicyCase | ServicePolicyCase;
  className?: string;
}

export function CaseCard({ caseData, className }: CaseCardProps) {
  if (!caseData) {
    return (
      <div className={cn("case-card group p-6 rounded-lg border border-border/50", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-primary/10 rounded w-20"></div>
          <div className="h-6 bg-card-foreground/10 rounded w-3/4"></div>
          <div className="h-4 bg-muted-foreground/10 rounded w-full"></div>
          <div className="h-4 bg-muted-foreground/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const facilityName = caseData.facility?.FAC_NAME || 'Unknown Facility';
  const facilityCity = caseData.facility?.FAC_CITY;
  const facilityState = caseData.facility?.FAC_STATE;
  const locationText = facilityCity && facilityState 
    ? `${facilityCity}, ${facilityState}`
    : 'Location unknown';

  return (  
    <Link to={`/case/${caseData.id}`} className="block">
      <div className={cn("case-card group p-6 rounded-lg border border-border/50 hover:border-border transition-colors", className)}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {caseData.category || 'Uncategorized'}
          </span>
          {caseData.impact && (
            <span className="inline-flex items-center gap-1 rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-400/20">
              <AlertTriangle className="h-3 w-3" />
              High Impact
            </span>
          )}
        </div>
        
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-card-foreground/90 group-hover:text-card-foreground transition-colors">
          {caseData.title || 'Untitled Case'}
        </h3>
        
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {caseData.summary || 'No summary available'}
        </p>

        <div className="mt-4 flex items-center text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(caseData.startDate).toLocaleDateString()}</span>
          </div>
          <div className="px-2 py-1 rounded-full bg-primary/5 text-primary">
            {caseData.status}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <div>{facilityName}</div>
            <div>{locationText}</div>
          </div>
          <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View details
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
