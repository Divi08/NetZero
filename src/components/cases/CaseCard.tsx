
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Case = {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
};

interface CaseCardProps {
  caseData: Case;
  className?: string;
}

export function CaseCard({ caseData, className }: CaseCardProps) {
  return (
    <Link to={`/case/${caseData.id}`}>
      <div className={cn("case-card group", className)}>
        <div className="inline-block">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {caseData.category}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-card-foreground/90 group-hover:text-card-foreground transition-colors">
          {caseData.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {caseData.summary}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {caseData.timestamp}
          </span>
          <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View details
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
