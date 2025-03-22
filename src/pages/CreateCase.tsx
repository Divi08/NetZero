
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";
import { AICaseAssistant } from "@/components/cases/AICaseAssistant";
import { useToast } from "@/components/ui/use-toast";

const CreateCase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    resources: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleResourceToggle = (resource: string) => {
    setFormData((prev) => {
      const exists = prev.resources.includes(resource);
      const updatedResources = exists
        ? prev.resources.filter((r) => r !== resource)
        : [...prev.resources, resource];
      
      return { ...prev, resources: updatedResources };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call and updating the cases list
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Case Created",
        description: "Your new case has been successfully created and added to the cases list.",
      });
      navigate("/");
    }, 2000);
  };
  
  const categories = [
    "Greenhouse Gas Emissions",
    "Carbon Capture",
    "Renewable Energy",
    "Climate Policy",
    "Ocean Acidification",
    "Arctic Ice Melt",
    "Rising Sea Levels",
    "Extreme Weather Events",
  ];
  
  const availableResources = [
    "ECHO Database",
    "EPA Reports",
    "OpenStreetMap",
    "TRACE API",
    "Global Emissions Data",
    "Satellite Imagery",
    "Weather Data",
  ];

  if (isSubmitting) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" text="Creating the case..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl py-8 px-6">
          <header className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Create a Case</h1>
            <p className="mt-2 text-muted-foreground">
              Provide details about the climate issue you want to address
            </p>
          </header>
          
          <AICaseAssistant />
          
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            <div className="glass-surface rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Case Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Provide a clear, descriptive title"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe the climate issue in detail"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City, State, Country or Coordinates"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-surface rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Data Resources</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select the data sources that should be used for AI analysis
              </p>
              
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {availableResources.map((resource) => {
                  const isSelected = formData.resources.includes(resource);
                  return (
                    <div
                      key={resource}
                      onClick={() => handleResourceToggle(resource)}
                      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-card hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3 w-3 text-white"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{resource}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Create Case
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateCase;
