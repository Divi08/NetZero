import { Sidebar } from "@/components/layout/Sidebar";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
            <p className="mt-2 text-muted-foreground">
              Browse and join active environmental investigations
            </p>
          </header>
          
          <Dashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;

