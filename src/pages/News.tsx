
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NewsItem {
  title: string;
  description: string;
  source: {
    name: string;
  };
  publishedAt: string;
  url: string;
}

// Mock initial news data related to climate change
const mockNewsData: NewsItem[] = [
  {
    title: "Global Carbon Emissions Hit New Record Despite Climate Efforts",
    description: "Latest research shows global carbon dioxide emissions have reached unprecedented levels, raising concerns about meeting Paris Agreement targets.",
    source: { name: "Climate Monitor" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "New Technology Promises Breakthrough in Carbon Capture",
    description: "Scientists develop innovative method to capture and store carbon dioxide from industrial emissions with 90% higher efficiency.",
    source: { name: "Tech & Climate" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Arctic Sea Ice Reaches Historic Low",
    description: "Satellite data reveals Arctic sea ice extent has decreased to lowest level since records began, accelerating global warming concerns.",
    source: { name: "Environmental Report" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Major Nations Announce New Climate Action Coalition",
    description: "Leading economies form new alliance to accelerate transition to renewable energy and achieve net-zero emissions by 2050.",
    source: { name: "Global Policy News" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Renewable Energy Costs Drop Below Fossil Fuels",
    description: "Latest industry analysis shows solar and wind power now cheaper than coal and gas in most major markets worldwide.",
    source: { name: "Energy Insights" },
    publishedAt: new Date().toISOString(),
    url: "#"
  },
  {
    title: "Climate Change Impacts on Global Agriculture",
    description: "New study reveals shifting weather patterns are affecting crop yields and food security in key agricultural regions.",
    source: { name: "Agriculture Today" },
    publishedAt: new Date().toISOString(),
    url: "#"
  }
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>(mockNewsData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(true);

  const fetchNews = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?` + 
        new URLSearchParams({
          q: '(climate change OR global warming OR carbon emissions OR renewable energy)',
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: '9898ff87cec64db28937c5ec569dd09a'
        })
      );
      const data = await response.json();
      setNewsItems(data.articles.slice(0, 6));
      setLastUpdated(new Date());
      setIsUsingMockData(false);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Climate News</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="text-muted-foreground">
                Stay updated with the latest developments in climate science and policy
              </p>
              <div className="text-sm text-muted-foreground text-right">
                <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
                {isUsingMockData && (
                  <p className="text-xs text-yellow-500">Using sample data. Click refresh for live updates.</p>
                )}
              </div>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading news...</p>
            ) : (
              newsItems.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {item.source.name} • {formatDate(item.publishedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <a 
                      href={item.url}
                      className="text-sm text-primary flex items-center hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read more <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          
          <div className="my-12 flex flex-col items-center justify-center space-y-4">
            <Separator className="w-full" />
            <Button 
              onClick={fetchNews}
              disabled={isRefreshing}
              variant="outline"
              size="lg"
              className="w-[200px]"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Get Live Updates'}
            </Button>
            <Separator className="w-full" />
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




