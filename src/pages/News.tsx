
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const newsItems = [
  {
    id: 1,
    title: "Record Methane Emissions Detected in Permafrost Regions",
    summary: "Satellite data reveals unprecedented levels of methane release from thawing permafrost, accelerating climate feedback loops.",
    source: "Climate Science Journal",
    date: "June 12, 2023",
    link: "#"
  },
  {
    id: 2,
    title: "New Carbon Capture Technology Shows Promising Results",
    summary: "Breakthrough in direct air capture technology could remove carbon dioxide at significantly lower costs than previous methods.",
    source: "Tech Climate Review",
    date: "May 28, 2023",
    link: "#"
  },
  {
    id: 3,
    title: "Global Emissions Reached New High Despite Pandemic Slowdown",
    summary: "Latest data from the Global Carbon Project shows emissions have rebounded and surpassed pre-pandemic levels.",
    source: "Environmental Policy Institute",
    date: "May 15, 2023",
    link: "#"
  },
  {
    id: 4,
    title: "Arctic Sea Ice Reaches Second-Lowest Extent on Record",
    summary: "Scientists warn that the rapidly diminishing sea ice could lead to cascading effects on global weather patterns.",
    source: "Polar Research Center",
    date: "April 30, 2023",
    link: "#"
  },
  {
    id: 5,
    title: "Major Oil Companies Pledge Net-Zero Emissions by 2050",
    summary: "Industry giants announce ambitious climate goals, but environmental groups question implementation strategies.",
    source: "Energy Policy Review",
    date: "April 18, 2023",
    link: "#"
  },
  {
    id: 6,
    title: "UN Report: Current Climate Pledges Insufficient to Meet Paris Agreement",
    summary: "Analysis shows current national commitments will lead to 2.7°C warming by 2100, well above the 1.5°C target.",
    source: "United Nations",
    date: "April 5, 2023",
    link: "#"
  },
];

const resources = [
  {
    name: "ECHO Database",
    description: "Enforcement and Compliance History Online - EPA's database for compliance and enforcement information",
    link: "https://echo.epa.gov/"
  },
  {
    name: "EPA Climate Change Resources",
    description: "Comprehensive information on climate science, policies and actions",
    link: "https://www.epa.gov/climate-change"
  },
  {
    name: "Global Carbon Atlas",
    description: "Platform to explore and visualize global carbon emissions data",
    link: "http://www.globalcarbonatlas.org/"
  },
  {
    name: "NASA Climate Change Portal",
    description: "Scientific data, visualizations and resources on climate change",
    link: "https://climate.nasa.gov/"
  },
  {
    name: "TRACE Resource Center",
    description: "Tools for tracking and analyzing carbon emissions",
    link: "#"
  },
];

const News = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Climate News</h1>
            <p className="mt-2 text-muted-foreground">
              Stay updated with the latest developments in climate science and policy
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-xs">{item.source} • {item.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                </CardContent>
                <CardFooter>
                  <a 
                    href={item.link} 
                    className="text-sm text-primary flex items-center hover:underline"
                  >
                    Read more <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Climate Research Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </CardContent>
                  <CardFooter>
                    <a 
                      href={resource.link} 
                      className="text-sm text-primary flex items-center hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit resource <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default News;
