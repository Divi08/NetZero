import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import { PolicyCase } from "@/services/caseService";

export type SortOption = {
  label: string;
  value: keyof PolicyCase | 'facility.FAC_NAME' | 'facility.FAC_CITY';
  direction: 'asc' | 'desc';
};

interface CaseSortProps {
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
}

export function CaseSort({ onSort, currentSort }: CaseSortProps) {
  const sortOptions: SortOption[] = [
    { label: 'Title A-Z', value: 'title', direction: 'asc' },
    { label: 'Title Z-A', value: 'title', direction: 'desc' },
    { label: 'Category A-Z', value: 'category', direction: 'asc' },
    { label: 'Category Z-A', value: 'category', direction: 'desc' },
    { label: 'Facility Name A-Z', value: 'facility.FAC_NAME', direction: 'asc' },
    { label: 'Facility Name Z-A', value: 'facility.FAC_NAME', direction: 'desc' },
    { label: 'City A-Z', value: 'facility.FAC_CITY', direction: 'asc' },
    { label: 'City Z-A', value: 'facility.FAC_CITY', direction: 'desc' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by {currentSort.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={`${option.value}-${option.direction}`}
            onClick={() => onSort(option)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {currentSort.value === option.value && 
             currentSort.direction === option.direction && (
              option.direction === 'asc' ? 
                <SortAsc className="h-4 w-4" /> : 
                <SortDesc className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 