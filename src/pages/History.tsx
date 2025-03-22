
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Mock history data
const visitedCases = [
  {
    id: "case-1",
    title: "Methane Leaks in Natural Gas Infrastructure",
    category: "Greenhouse Gas Emissions",
    timestamp: "Today at 10:23 AM",
    date: "June 15, 2023"
  },
  {
    id: "case-3",
    title: "Arctic Permafrost Thawing Acceleration",
    category: "Carbon Feedback Loops",
    timestamp: "Today at 9:15 AM",
    date: "June 15, 2023"
  },
  {
    id: "case-2",
    title: "Industrial Carbon Emissions Violations",
    category: "Air Quality",
    timestamp: "Yesterday at 4:32 PM",
    date: "June 14, 2023"
  },
  {
    id: "case-4",
    title: "Rising Sea Levels in Pacific Islands",
    category: "Climate Impact",
    timestamp: "Yesterday at 2:18 PM",
    date: "June 14, 2023"
  },
  {
    id: "case-5",
    title: "Renewable Energy Implementation Challenges",
    category: "Energy Transition",
    timestamp: "June 12, 2023 at 11:05 AM",
    date: "June 12, 2023"
  },
  {
    id: "case-6",
    title: "Deforestation Impact on Carbon Sequestration",
    category: "Land Use",
    timestamp: "June 10, 2023 at 3:45 PM",
    date: "June 10, 2023"
  },
];

// Group cases by date
const groupedCases = visitedCases.reduce((acc, caseItem) => {
  if (!acc[caseItem.date]) {
    acc[caseItem.date] = [];
  }
  acc[caseItem.date].push(caseItem);
  return acc;
}, {} as Record<string, typeof visitedCases>);

const History = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">History</h1>
            <p className="mt-2 text-muted-foreground">
              Your recently visited cases and investigations
            </p>
          </header>
          
          <div className="space-y-8">
            {Object.entries(groupedCases).map(([date, cases]) => (
              <div key={date} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-medium">{date}</h2>
                </div>
                
                <div className="space-y-3">
                  {cases.map((caseItem) => (
                    <Link 
                      key={caseItem.id} 
                      to={`/case/${caseItem.id}`}
                      className="block"
                    >
                      <div className="p-4 rounded-lg border hover:bg-card/50 transition-colors flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="inline-block">
                              <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-1 text-xs font-medium">
                                {caseItem.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{caseItem.timestamp}</span>
                            </div>
                          </div>
                          <h3 className="mt-1 font-medium">{caseItem.title}</h3>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
