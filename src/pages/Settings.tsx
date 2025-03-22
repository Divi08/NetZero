
import { Sidebar } from "@/components/layout/Sidebar";
import { Moon, Sun } from "lucide-react";

const Settings = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl py-8 px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="mt-2 text-muted-foreground">
              Customize your experience
            </p>
          </header>
          
          <div className="space-y-8">
            <div className="glass-surface rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                  </div>
                </div>
                
                <div className="h-6 w-12 rounded-full bg-slate-200 dark:bg-slate-700 p-1 cursor-pointer transition-colors relative">
                  <div className="absolute h-4 w-4 rounded-full bg-white transform translate-x-0 transition-transform shadow-sm"></div>
                </div>
              </div>
            </div>
            
            <div className="glass-surface rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Case updates</p>
                    <p className="text-sm text-muted-foreground">Receive notifications about case activity</p>
                  </div>
                  
                  <div className="h-6 w-12 rounded-full bg-primary p-1 cursor-pointer transition-colors relative">
                    <div className="absolute h-4 w-4 rounded-full bg-white transform translate-x-6 transition-transform shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New cases</p>
                    <p className="text-sm text-muted-foreground">Alerts about new cases matching your interests</p>
                  </div>
                  
                  <div className="h-6 w-12 rounded-full bg-primary p-1 cursor-pointer transition-colors relative">
                    <div className="absolute h-4 w-4 rounded-full bg-white transform translate-x-6 transition-transform shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
