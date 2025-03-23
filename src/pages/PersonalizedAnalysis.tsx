import { useState, useEffect, useRef } from "react";
 import { Sidebar } from "@/components/layout/Sidebar";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import { Slider } from "@/components/ui/slider";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Separator } from "@/components/ui/separator";
 import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
 import { Badge } from "@/components/ui/badge";
 import { 
   Search, Globe, Leaf, Factory, Wind, Droplet, AlertTriangle, 
   User, GanttChart, FileText, BarChart2, Thermometer
 } from "lucide-react";
 import { GoogleGenerativeAI } from "@google/generative-ai";
 import { motion } from "framer-motion";
 import "../styles/globalAnalysis.css";
 
 // Mock data for city suggestions
 const CITY_SUGGESTIONS = [
   "New York, USA", "London, UK", "Tokyo, Japan", "Paris, France", "Sydney, Australia", 
   "Cape Town, South Africa", "Rio de Janeiro, Brazil", "Mumbai, India", "Beijing, China",
   "Stockholm, Sweden", "Amsterdam, Netherlands", "Cairo, Egypt", "Dubai, UAE",
   "Toronto, Canada", "Mexico City, Mexico", "Berlin, Germany", "Moscow, Russia",
   "Bangkok, Thailand", "Seoul, South Korea", "Singapore, Singapore", "Madrid, Spain",
   "Buenos Aires, Argentina", "Istanbul, Turkey", "Nairobi, Kenya", "Jakarta, Indonesia",
   "Oslo, Norway", "Helsinki, Finland", "Athens, Greece", "Dublin, Ireland",
   "Vienna, Austria", "Brussels, Belgium", "Lisbon, Portugal", "Copenhagen, Denmark",
   "Warsaw, Poland", "Prague, Czech Republic", "Budapest, Hungary", "Zurich, Switzerland",
   "Santiago, Chile", "Lima, Peru", "Bogotá, Colombia", "Auckland, New Zealand",
   "Manila, Philippines", "Kuala Lumpur, Malaysia", "Hanoi, Vietnam", "Tel Aviv, Israel",
   "Riyadh, Saudi Arabia", "Vancouver, Canada", "Montreal, Canada", "São Paulo, Brazil"
 ];
 
 // Mock data for habits and policies
 const COMMON_HABITS = [
   "Daily commute by car", "Meat-heavy diet", "Frequent air travel", 
   "High water usage", "Excessive electricity consumption", "Fast fashion consumption",
   "Single-use plastic usage", "Long hot showers", "Food waste", 
   "Standby electronics", "Chemical lawn care", "Recreational boating",
   "Heating/cooling home excessively", "Daily paper newspaper", "Regular use of disposable items"
 ];
 
 const COMMON_POLICIES = [
   "Carbon tax", "Renewable energy subsidies", "Public transportation expansion", 
   "Plastic ban", "Reforestation initiatives", "Green building standards",
   "Electric vehicle incentives", "Carbon capture investments", "Sustainable agriculture subsidies",
   "Waste reduction programs", "Water conservation mandates", "Environmental education programs",
   "Emissions cap and trade", "Green job training", "Clean energy research funding"
 ];
 
 // Add motion variants for animations
 const containerVariants = {
   hidden: { opacity: 0 },
   visible: { 
     opacity: 1,
     transition: {
       when: "beforeChildren",
       staggerChildren: 0.1
     }
   }
 };
 
 const itemVariants = {
   hidden: { opacity: 0, y: 20 },
   visible: { 
     opacity: 1, 
     y: 0,
     transition: { 
       type: "spring",
       damping: 10,
       stiffness: 100
     }
   }
 };
 
 const fadeInVariants = {
   hidden: { opacity: 0 },
   visible: { 
     opacity: 1,
     transition: { duration: 0.6 }
   }
 };
 
 const slideUpVariants = {
   hidden: { opacity: 0, y: 50 },
   visible: { 
     opacity: 1, 
     y: 0,
     transition: { 
       type: "spring", 
       duration: 0.8,
       bounce: 0.3
     }
   }
 };
 
 const pulseVariants = {
   pulse: {
     scale: [1, 1.05, 1],
     transition: {
       duration: 2,
       repeat: Infinity,
       repeatType: "reverse" as const
     }
   }
 };

// Define types for the formatted analysis text
interface FormattedSection {
  type: 'header' | 'notes';
  content: string;
  emoji?: string;
}
 
// Function to help format sections with better structure
const formatAnalysisText = (text: string): FormattedSection => {
  // Handle section headers with emojis instead of ###
  if (text.startsWith('###')) {
    const title = text.replace('###', '').trim();
    // Add appropriate emoji based on section content
    let emoji = '📊';
    if (title.includes('Temperature')) emoji = '🌡️';
    else if (title.includes('Sea Level')) emoji = '🌊';
    else if (title.includes('Biodiversity')) emoji = '🌿';
    else if (title.includes('Air Quality')) emoji = '💨';
    else if (title.includes('Economic')) emoji = '💰';
    else if (title.includes('What You Can Do')) emoji = '👤';
    else if (title.includes('Policy Impact')) emoji = '📜';
    
    return {
      type: 'header',
      content: title,
      emoji: emoji
    };
  }

  // Format numbers and measurements to stand out
  let formattedText = text.replace(
    /(\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?(?:\s*million|\s*billion)?|\d+(?:\.\d+)?(?:\s*tons|\s*kg|\s*cm|\s*°C))/g,
    '<span class="data-point">$1</span>'
  );

  // Remove bullets, asterisks, and other markdown syntax
  formattedText = formattedText
    .replace(/^\s*[\*\-]\s+/gm, '') // Remove bullet points
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **bold** to <strong>
    .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Convert *italic* to <em>

  // Split into sentences for better readability
  const sentences = formattedText.split(/(?<=[.!?])\s+/);
  
  // Group sentences into concise paragraphs (2-3 sentences per paragraph)
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const paragraph = sentences.slice(i, i + 3).join(' ');
    if (paragraph.trim().length > 0) {
      paragraphs.push(`<p class="mb-3">${paragraph.trim()}</p>`);
    }
  }

  return {
    type: 'notes',
    content: paragraphs.join('')
  };
};

// Update the section rendering
const renderAnalysisContent = (text: string): JSX.Element => {
  const sections = text.split('\n\n').map((section, idx) => {
    const formatted = formatAnalysisText(section);
    
    if (formatted.type === 'header') {
      return (
        <div key={idx} className="section-header flex items-center mb-3">
          <span className="text-2xl mr-2">{formatted.emoji}</span>
          <h3 className="text-lg font-semibold">{formatted.content}</h3>
        </div>
      );
    }

    return (
      <div 
        key={idx}
        className="analysis-content mb-5 text-slate-700 dark:text-slate-300"
        dangerouslySetInnerHTML={{ __html: formatted.content }}
      />
    );
  });

  return <div>{sections}</div>;
};
 
 // Add visualization component for key data points
 interface DataVisualizerProps {
   value: number;
   label: string;
   maxValue?: number;
   color?: string;
 }
 
 const DataVisualizer = ({ value, label, maxValue = 100, color = "blue" }: DataVisualizerProps) => {
   // Normalize the value to fit between 0-100
   const normalizedValue = Math.min(Math.max((value / maxValue) * 100, 0), 100);
   
   const colorClasses: Record<string, string> = {
     blue: "bg-blue-500",
     red: "bg-red-500",
     green: "bg-green-500",
     amber: "bg-amber-500",
     purple: "bg-purple-500"
   };
   
   return (
     <div className="my-3">
       <div className="chart-label">
         <span>{label}</span>
         <span className="font-medium">{value}%</span>
       </div>
       <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 w-full">
         <div 
           className={`h-2.5 rounded-full ${colorClasses[color] || "bg-blue-500"}`} 
           style={{ width: `${normalizedValue}%`, transition: "width 1s ease-out" }}
         />
       </div>
     </div>
   );
 };
 
 // Add Temperature trend component
 interface TempTrendProps {
   currentValue: number;
   projectedValue: number;
   year?: number;
 }
 
 const TempTrend = ({ currentValue, projectedValue, year = 2050 }: TempTrendProps) => {
   const increase = projectedValue - currentValue;
   const increasePercent = ((increase / currentValue) * 100).toFixed(1);
   
   return (
     <div className="p-4 bg-white/50 dark:bg-slate-800/30 rounded-lg my-4">
       <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
         Temperature Increase by {year}
       </h4>
       <div className="flex items-end space-x-2 mb-3">
         <div className="flex flex-col items-center">
           <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current</div>
           <div className={`h-16 w-6 bg-blue-100 dark:bg-blue-900/30 rounded-t-md relative overflow-hidden`}>
             <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm" style={{ height: '40%' }}>
               <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-700 dark:text-blue-300">
                 {currentValue}°C
               </span>
             </div>
           </div>
         </div>
         <div className="h-8 w-8 flex-shrink-0 text-red-500">→</div>
         <div className="flex flex-col items-center">
           <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Projected</div>
           <div className={`h-16 w-6 bg-red-100 dark:bg-red-900/30 rounded-t-md relative overflow-hidden`}>
             <div className="absolute bottom-0 w-full bg-red-500 rounded-t-sm" style={{ height: `${40 + (increase * 10)}%` }}>
               <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-700 dark:text-red-300">
                 {projectedValue}°C
               </span>
             </div>
           </div>
         </div>
         <div className="flex flex-col ml-4">
           <span className="text-xs text-slate-500 dark:text-slate-400">Increase</span>
           <span className="text-lg font-bold text-red-500">+{increase}°C</span>
           <span className="text-xs text-red-500">+{increasePercent}%</span>
         </div>
       </div>
     </div>
   );
 };
 
 // Enhanced globe visualization component with actual Earth texture
 interface GlobeVisualizationProps {
   selectedLocation: string;
 }

const GlobeVisualization = ({ selectedLocation }: GlobeVisualizationProps) => {
  const globeRef = useRef<HTMLDivElement | null>(null);
   
  useEffect(() => {
    if (selectedLocation && globeRef.current) {
      // When location changes, animate the globe
      simulateGlobeRotation();
    }
  }, [selectedLocation]);
   
  const simulateGlobeRotation = () => {
    if (globeRef.current) {
      // Reset any ongoing animations
      globeRef.current.classList.remove("globe-animate", "globe-pulse");
      
      // Force a reflow before adding the animation class again
      void globeRef.current.offsetWidth;
      
      // Add rotation animation
      globeRef.current.classList.add("globe-animate");
      
      // Add pulsing effect when done rotating
      setTimeout(() => {
        if (globeRef.current) {
          globeRef.current.classList.remove("globe-animate");
          globeRef.current.classList.add("globe-pulse");
        }
      }, 2000);
    }
  };

  // Get coordinate estimate for the selected location
  const getLocationCoordinates = (): {top: string, left: string} => {
    // This would ideally be replaced with a proper geocoding service
    // For now, we'll just use some approximate values for demo purposes
    const locationMap: Record<string, {top: string, left: string}> = {
      "New York": { top: '35%', left: '25%' },
      "London": { top: '28%', left: '45%' },
      "Tokyo": { top: '35%', left: '80%' },
      "Paris": { top: '30%', left: '47%' },
      "Sydney": { top: '70%', left: '85%' },
      "Toronto": { top: '30%', left: '23%' },
      "Beijing": { top: '35%', left: '75%' },
      "Berlin": { top: '28%', left: '50%' },
      "Moscow": { top: '25%', left: '60%' },
      "Cairo": { top: '40%', left: '55%' },
      "Singapore": { top: '55%', left: '75%' },
      "Rio de Janeiro": { top: '60%', left: '35%' },
      "Mumbai": { top: '45%', left: '65%' },
      "Dubai": { top: '43%', left: '60%' },
      "Madrid": { top: '35%', left: '45%' },
    };
    
    const cityName = selectedLocation ? selectedLocation.split(',')[0] : '';
    return locationMap[cityName] || { top: '40%', left: '60%' };
  };
   
  const coords = getLocationCoordinates();
   
  return (
    <motion.div 
      className="relative w-28 h-28"
      variants={itemVariants}
    >
      <motion.div 
        ref={globeRef} 
        className="relative h-28 w-28 rounded-full flex items-center justify-center transition-all duration-1000 shadow-lg overflow-hidden earth-globe"
        animate={{ 
          boxShadow: [
            "0 10px 25px -15px rgba(59, 130, 246, 0.5)",
            "0 10px 25px -10px rgba(59, 130, 246, 0.7)",
            "0 10px 25px -15px rgba(59, 130, 246, 0.5)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="earth-surface"
        >
        </motion.div>
        {selectedLocation && (
          <motion.div 
            className="absolute h-3 w-3 bg-red-500 rounded-full z-10" 
            style={{ 
              top: coords.top, 
              left: coords.left,
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0.7)",
                "0 0 0 8px rgba(239, 68, 68, 0)",
                "0 0 0 0 rgba(239, 68, 68, 0)"
              ],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <motion.div 
              className="absolute inset-0 rounded-full bg-red-400 opacity-75"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </motion.div>
        )}
      </motion.div>
      {selectedLocation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-800 px-3 py-1 rounded-full text-xs text-slate-200 whitespace-nowrap shadow-md"
        >
          {selectedLocation.split(',')[0]}
        </motion.div>
      )}
    </motion.div>
  );
};
 
 const PersonalizedAnalysis = () => {
   // References
   const globeRef = useRef<HTMLDivElement | null>(null);
   
   // State
   const [searchTerm, setSearchTerm] = useState<string>("");
   const [selectedLocation, setSelectedLocation] = useState<string>("");
   const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
   const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
   const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
   const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
   const [customHabit, setCustomHabit] = useState<string>("");
   const [customPolicy, setCustomPolicy] = useState<string>("");
   const [carbonEmissions, setCarbonEmissions] = useState<number[]>([50]);
   const [deforestation, setDeforestation] = useState<number[]>([30]);
   const [renewableEnergy, setRenewableEnergy] = useState<number[]>([40]);
   const [analysis, setAnalysis] = useState<string | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   const [activeTab, setActiveTab] = useState<string>("habits");
   
   // Filter suggestions based on search term
   useEffect(() => {
     if (searchTerm.length > 0) {
       const filtered = CITY_SUGGESTIONS.filter(city => 
         city.toLowerCase().includes(searchTerm.toLowerCase())
       );
       setFilteredSuggestions(filtered);
       setShowSuggestions(true);
     } else {
       setShowSuggestions(false);
     }
   }, [searchTerm]);
   
   // Function to animate the globe
   const simulateGlobeRotation = () => {
     if (globeRef.current) {
       // Reset any ongoing animations
       globeRef.current.classList.remove("globe-animate", "globe-pulse");
       
       // Force a reflow before adding the animation class again
       void globeRef.current.offsetWidth;
       
       // Add rotation animation
       globeRef.current.classList.add("globe-animate");
       
       // Add pulsing effect when done rotating
       setTimeout(() => {
         if (globeRef.current) {
           globeRef.current.classList.remove("globe-animate");
           globeRef.current.classList.add("globe-pulse");
         }
       }, 2000);
     }
   };
   
   // Handle the selection of a location and animate globe
   const handleLocationSelect = (location: string) => {
     setSelectedLocation(location);
     setSearchTerm(location);
     setShowSuggestions(false);
     
     // Animate globe to selected location (in a real implementation, this would use a 3D library)
     simulateGlobeRotation();
   };
   
   // Add or remove habit from selected habits
   const toggleHabit = (habit: string) => {
     setSelectedHabits(prev => 
       prev.includes(habit) 
         ? prev.filter(h => h !== habit) 
         : [...prev, habit]
     );
   };
   
   // Add or remove policy from selected policies
   const togglePolicy = (policy: string) => {
     setSelectedPolicies(prev => 
       prev.includes(policy) 
         ? prev.filter(p => p !== policy) 
         : [...prev, policy]
     );
   };
   
   // Add custom habit
   const addCustomHabit = () => {
     if (customHabit.trim()) {
       setSelectedHabits(prev => [...prev, customHabit.trim()]);
       setCustomHabit("");
     }
   };
   
   // Add custom policy
   const addCustomPolicy = () => {
     if (customPolicy.trim()) {
       setSelectedPolicies(prev => [...prev, customPolicy.trim()]);
       setCustomPolicy("");
     }
   };
   
   // Generate analysis using Gemini AI
   const generateAnalysis = async () => {
     if (!selectedLocation) {
       alert("Please select a location first!");
       return;
     }
     
     setLoading(true);
     
     try {
       // Use Gemini API to generate analysis
       // Get the API key and log it for debugging (will show as masked)
       const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
       console.log("API Key available:", !!apiKey, "Length:", apiKey?.length);
       
       if (!apiKey) {
         console.error("Gemini API key is missing. Falling back to mock data.");
         try {
           const mockAnalysis = generateMockAnalysis();
           setAnalysis(mockAnalysis);
         } catch (mockError) {
           console.error("Error generating mock data:", mockError);
           setAnalysis("Unable to generate analysis. Please try again later.");
         }
         setLoading(false);
         return;
       }
       
       const genAI = new GoogleGenerativeAI(apiKey);
       // Set the proper model name without safety settings for now
       const model = genAI.getGenerativeModel({ 
         model: "gemini-2.0-flash",
         generationConfig: {
           temperature: 0.7,
           topP: 0.8,
           topK: 40
         }
       });
       console.log("Gemini model initialized with model: gemini-2.0-flash");
       
       const prompt = `
         Generate a detailed climate impact analysis for ${selectedLocation} that directly addresses how the user's selected habits and policies affect climate outcomes.
         
         User's Personal Habits: ${selectedHabits.length > 0 ? selectedHabits.join(", ") : "No specific habits selected"}
         User's Policy Preferences: ${selectedPolicies.length > 0 ? selectedPolicies.join(", ") : "No specific policies selected"}
         
         Environmental Factors:
         - Carbon emissions level: ${carbonEmissions[0]}%
         - Deforestation rate: ${deforestation[0]}%
         - Renewable energy adoption: ${renewableEnergy[0]}%
         
         For each section below, specifically address how the user's habits and policies contribute to or mitigate the climate impacts:
         
         1. In the Temperature Projections section, analyze how the user's specific habits (like ${selectedHabits.slice(0, 3).join(", ")}) and policy preferences directly impact temperature.
         
         2. In the Sea Level section, connect coastal impacts to the user's behaviors and policy choices.
         
         3. For Biodiversity Impact, explain how the user's specific choices affect local ecosystems.
         
         4. For Air Quality, make direct connections between the user's selected habits and respiratory health impacts.
         
         5. For Economic Assessment, analyze the financial implications of the user's chosen habits and policies.
         
         6. For Policy Impact Analysis, evaluate the effectiveness of the user's selected policies against alternatives.
         
         7. In the "What You Can Do" section, provide personalized recommendations based on the habits they've already selected versus those they haven't.
         
         Format the analysis with the following structure and use bullet points for all content:
         
         ### 🌡️ Temperature Projections (2050)
         • [Connect user's specific habits to temperature rise]
         • [Impact of their policy choices on temperature scenarios]
         • [Specific numerical projection based on their inputs]
         
         ### 🌊 Sea Level and Coastal Impact
         • [How user's habits influence sea level rise]
         • [Coastal vulnerability assessment specific to their location and choices]
         • [Adaptation recommendations based on their policy preferences]
         
         ### 🌿 Biodiversity Impact
         • [Species impacts directly related to user's consumption choices]
         • [How their policy preferences affect habitat protection]
         • [Local ecosystem vulnerabilities based on their location]
         
         ### 💨 Air Quality Implications
         • [Respiratory health impacts linked to specific user habits]
         • [How their policy choices affect air pollution levels]
         • [Urban heat island effects in their location]
         
         ### 💰 Economic Assessment
         • [Direct costs of climate impacts based on user's location]
         • [Financial benefits of their selected sustainable habits]
         • [Long-term economic value of their policy preferences]
         
         ### 📜 Policy Impact Analysis
         • [Effectiveness evaluation of user's selected policies]
         • [Gaps in their policy selections]
         • [Policy synergies and recommendations]
         
         ### 👤 What You Can Do
         • [Highest impact habit changes based on what they haven't selected]
         • [Additional policy support recommendations]
         • [Location-specific actions with measurable impact]
         
         Make all numerical values (percentages, measurements, monetary amounts) stand out by putting them in exact numbers. Include specific figures like temperature increase in °C, sea level rise in cm, economic costs in $, and percentage changes.
         
         Base the analysis on IPCC reports and peer-reviewed climate science. Keep the tone informative but not alarmist.
       `;
       
       console.log("Sending prompt to Gemini API");
       try {
         const result = await model.generateContent(prompt);
         console.log("Received response from Gemini API");
         const response = await result.response;
         const text = response.text();
         console.log("Analysis text length:", text?.length);
         
         // If Gemini API fails, fall back to mock data
         if (!text || text.trim() === "") {
           console.warn("Gemini returned empty response, using mock data instead");
           setTimeout(() => {
             try {
               const mockAnalysis = generateMockAnalysis();
               setAnalysis(mockAnalysis);
             } catch (mockError) {
               console.error("Error generating mock data:", mockError);
               setAnalysis("Unable to generate analysis. Please try again later.");
             }
             setLoading(false);
           }, 1000);
         } else {
           setAnalysis(text);
           setLoading(false);
         }
       } catch (firstError) {
         console.error("Error with gemini-2.0-flash model, trying fallback model:", firstError);
         
         // Try with a different model as fallback
         try {
           // Try with gemini-1.5-flash as fallback
           const fallbackModel = genAI.getGenerativeModel({ 
             model: "gemini-1.5-flash",
             generationConfig: {
               temperature: 0.7,
               topP: 0.8,
               topK: 40
             }
           });
           console.log("Trying fallback model: gemini-1.5-flash");
           
           const result = await fallbackModel.generateContent(prompt);
           console.log("Received response from fallback model");
           const response = await result.response;
           const text = response.text();
           console.log("Analysis text length:", text?.length);
           
           if (!text || text.trim() === "") {
             throw new Error("Empty response from fallback model");
           }
           
           setAnalysis(text);
           setLoading(false);
         } catch (fallbackError) {
           console.error("Fallback model also failed:", fallbackError);
           // Fall back to mock data if both API calls fail
           try {
             const mockAnalysis = generateMockAnalysis();
             setAnalysis(mockAnalysis);
           } catch (mockError) {
             console.error("Error generating mock data:", mockError);
             setAnalysis("Unable to generate analysis. Please try again later.");
           }
           setLoading(false);
         }
       }
     } catch (error) {
       console.error("Unexpected error:", error);
       // General error fallback
       try {
         const mockAnalysis = generateMockAnalysis();
         setAnalysis(mockAnalysis);
       } catch (mockError) {
         console.error("Error generating mock data:", mockError);
         setAnalysis("Unable to generate analysis. Please try again later.");
       }
       setLoading(false);
     }
   };
   
   // Generate mock analysis (for demonstration purposes)
   const generateMockAnalysis = (): string => {
     console.log("Generating mock analysis data");
     const cityName = selectedLocation.split(',')[0] || "your city";
     
     // Use different analysis for different cities
     let baseTemperature = 1.8;
     let seaLevelRise = 20;
     let biodiversityRisk = 15;
     let airQualityImpact = 18;
     let economicCost = 250;
     
     // Adjust based on the city
     if (["New York", "Miami", "Boston", "Tokyo", "Singapore", "Jakarta", "Venice", "Amsterdam", "Rotterdam"].includes(cityName)) {
       seaLevelRise = 32; // Coastal cities face higher sea level impacts
     }
     
     if (["Beijing", "Delhi", "Cairo", "Mexico City", "Shanghai", "Los Angeles"].includes(cityName)) {
       airQualityImpact = 28; // Cities with existing air quality challenges
     }
     
     // Adjust based on selected environmental factors
     if (carbonEmissions[0] > 70) {
       baseTemperature += 0.5;
       airQualityImpact += 8;
     }
     
     if (deforestation[0] > 50) {
       biodiversityRisk += 10;
       seaLevelRise += 5;
     }
     
     if (renewableEnergy[0] < 30) {
       economicCost += 100;
     }
     
     // Use selected habits to personalize the analysis
     const habitImpacts = [];
     if (selectedHabits.includes("Daily commute by car")) {
       habitImpacts.push("Car commuting adds 2.4 tons of CO2 annually");
     }
     if (selectedHabits.includes("Meat-heavy diet")) {
       habitImpacts.push("Meat consumption increases carbon footprint by 1.5 tons yearly");
     }
     if (selectedHabits.includes("Frequent air travel")) {
       habitImpacts.push("Air travel contributes 3.5 tons of CO2 per long-haul flight");
     }
     
     // Format as concise paragraphs with clear numerical values
     return `
 ### Temperature Projections (2050)
 Projected temperature increase for ${cityName} will reach ${baseTemperature}°C by 2050. This will cause ${Math.round(baseTemperature * 15)}% more heatwaves and 35% longer summer drought periods. ${habitImpacts.length > 0 ? habitImpacts[0] + "." : "Your habits contribute significantly to regional warming."}

 ### Sea Level and Coastal Impact
 Sea levels will rise ${seaLevelRise}cm by 2050, increasing coastal flooding by ${Math.round(seaLevelRise * 1.5)}%. This threatens ${seaLevelRise > 25 ? "critical" : "important"} infrastructure including ports, coastal roads, and urban drainage. Annual economic losses from flooding will reach $${Math.round(seaLevelRise * 8)} million.

 ### Biodiversity Impact
 ${biodiversityRisk}% of local wildlife species face habitat loss by 2050. Native species will decline at ${Math.round(biodiversityRisk * 1.2)}% annually, with ecosystem health deviating ${Math.round(biodiversityRisk * 0.8)}% from baseline. Conservation efforts require $${Math.round(biodiversityRisk * 5)} million annually to mitigate damage.

 ### Air Quality Implications
 Air quality will worsen by ${airQualityImpact}% with ${Math.round(airQualityImpact * 1.4)}% more respiratory health incidents. Urban heat islands will intensify temperatures by ${Math.round(airQualityImpact * 0.2)}°C in city centers. Health-related costs will increase by $${Math.round(airQualityImpact * 3)} million annually due to pollution.

 ### Economic Assessment
 Climate adaptation costs for ${cityName} will reach $${economicCost} million annually by 2050. Infrastructure upgrades will require $${Math.round(economicCost * 0.4)} million while economic productivity could drop ${Math.round(economicCost * 0.15)}%. Insurance premiums will rise by ${Math.round(economicCost * 0.08)}% due to increased climate risks.

 ### Policy Impact Analysis
 ${selectedPolicies.length > 0 ? `Your selected policies could reduce emissions by ${Math.round(selectedPolicies.length * 7)}% by 2050.` : "No policies selected, limiting mitigation potential to less than 5%."}
 Implementing carbon pricing would add $${Math.round(economicCost * 0.2)} million to the local economy through green jobs. Policy implementation requires 2-5 years to show measurable climate benefits.

 ### What You Can Do
 Reducing car use cuts your carbon footprint by 2.4 tons annually. Switching to renewable energy saves ${Math.round(renewableEnergy[0] * 0.5)}% on energy costs. Home efficiency improvements yield $${Math.round(baseTemperature * 200)} annual savings while preventing ${Math.round(baseTemperature * 0.5)} tons of CO2 emissions.
 `;
   };
   
   return (
     <div className="flex h-screen bg-background">
       <Sidebar />
       <main className="flex-1 p-6 overflow-auto">
         <motion.div
           initial="hidden"
           animate="visible"
           variants={containerVariants}
           className="max-w-6xl mx-auto space-y-6"
         >
           <motion.div 
             variants={itemVariants}
             className="flex justify-between items-center"
           >
             <h2 className="text-3xl font-bold tracking-tight">Personal Climate Impact Analysis</h2>
           </motion.div>
           
           <motion.div 
             variants={itemVariants}
             className="flex gap-4 items-center"
           >
             <div className="relative flex-1">
               <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="text"
                   placeholder="Enter a city or region..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-8"
                 />
               </div>
               
               {showSuggestions && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                   className="absolute w-full mt-1 bg-popover border rounded-md shadow-md z-10 max-h-60 overflow-auto"
                 >
                   {filteredSuggestions.length > 0 ? (
                     filteredSuggestions.map((city, index) => (
                       <motion.div
                         key={index}
                         whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                         className="p-2 hover:bg-accent cursor-pointer"
                         onClick={() => handleLocationSelect(city)}
                       >
                         {city}
                       </motion.div>
                     ))
                   ) : (
                     <div className="p-2 text-muted-foreground">No locations found</div>
                   )}
                 </motion.div>
               )}
             </div>
             
             {/* Replace Globe with enhanced GlobeVisualization */}
             <GlobeVisualization selectedLocation={selectedLocation} />
           </motion.div>
           
           {selectedLocation && (
             <>
               <motion.div 
                 variants={slideUpVariants}
                 className="grid grid-cols-2 gap-6"
               >
                 <motion.div variants={itemVariants}>
                   <Card>
                     <CardHeader>
                       <CardTitle>
                         <Tabs defaultValue="habits" onValueChange={setActiveTab}>
                           <TabsList className="grid w-full grid-cols-2">
                             <TabsTrigger value="habits">Personal Habits</TabsTrigger>
                             <TabsTrigger value="policies">Policy Preferences</TabsTrigger>
                           </TabsList>
                         
                           <TabsContent value="habits" className="mt-4">
                             <ScrollArea className="h-72 pr-6">
                               <motion.div 
                                 variants={containerVariants}
                                 initial="hidden"
                                 animate="visible"
                                 className="space-y-4"
                               >
                                 {COMMON_HABITS.map((habit, index) => (
                                   <motion.div 
                                     key={index} 
                                     variants={itemVariants}
                                     className="flex items-center space-x-2"
                                     whileHover={{ x: 5 }}
                                     transition={{ type: "spring", stiffness: 400 }}
                                   >
                                     <Checkbox 
                                       id={`habit-${index}`} 
                                       checked={selectedHabits.includes(habit)}
                                       onCheckedChange={() => toggleHabit(habit)}
                                     />
                                     <label
                                       htmlFor={`habit-${index}`}
                                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                     >
                                       {habit}
                                     </label>
                                   </motion.div>
                                 ))}
                                 
                                 {selectedHabits
                                   .filter(habit => !COMMON_HABITS.includes(habit))
                                   .map((customHabit, index) => (
                                     <div key={`custom-${index}`} className="flex items-center justify-between">
                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id={`custom-habit-${index}`} 
                                           checked={true}
                                           onCheckedChange={() => toggleHabit(customHabit)}
                                         />
                                         <label
                                           htmlFor={`custom-habit-${index}`}
                                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                         >
                                           {customHabit}
                                         </label>
                                       </div>
                                       <Badge variant="outline">Custom</Badge>
                                     </div>
                                   ))}
                                 
                                 <Separator className="my-4" />
                                 
                                 <div className="flex space-x-2 mt-4 mb-4 mr-2">
                                   <Input
                                     placeholder="Add custom habit..."
                                     value={customHabit}
                                     onChange={(e) => setCustomHabit(e.target.value)}
                                     className="flex-1"
                                   />
                                   <Button onClick={addCustomHabit} size="sm">Add</Button>
                                 </div>
                               </motion.div>
                             </ScrollArea>
                           </TabsContent>
                           
                           <TabsContent value="policies" className="mt-4">
                             <ScrollArea className="h-72 pr-6">
                               <div className="space-y-4">
                                 {COMMON_POLICIES.map((policy, index) => (
                                   <div key={index} className="flex items-center space-x-2">
                                     <Checkbox 
                                       id={`policy-${index}`} 
                                       checked={selectedPolicies.includes(policy)}
                                       onCheckedChange={() => togglePolicy(policy)}
                                     />
                                     <label
                                       htmlFor={`policy-${index}`}
                                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                     >
                                       {policy}
                                     </label>
                                   </div>
                                 ))}
                                 
                                 {selectedPolicies
                                   .filter(policy => !COMMON_POLICIES.includes(policy))
                                   .map((customPolicy, index) => (
                                     <div key={`custom-policy-${index}`} className="flex items-center justify-between">
                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id={`custom-policy-${index}`} 
                                           checked={true}
                                           onCheckedChange={() => togglePolicy(customPolicy)}
                                         />
                                         <label
                                           htmlFor={`custom-policy-${index}`}
                                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                         >
                                           {customPolicy}
                                         </label>
                                       </div>
                                       <Badge variant="outline">Custom</Badge>
                                     </div>
                                   ))}
                                 
                                 <Separator className="my-4" />
                                 
                                 <div className="flex space-x-2 mt-4 mb-4 mr-2">
                                   <Input
                                     placeholder="Add custom policy..."
                                     value={customPolicy}
                                     onChange={(e) => setCustomPolicy(e.target.value)}
                                     className="flex-1"
                                   />
                                   <Button onClick={addCustomPolicy} size="sm">Add</Button>
                                 </div>
                               </div>
                             </ScrollArea>
                           </TabsContent>
                         </Tabs>
                       </CardTitle>
                     </CardHeader>
                   </Card>
                 </motion.div>
                 
                 <motion.div variants={itemVariants}>
                   <Card>
                     <CardHeader>
                       <CardTitle>Environmental Factors</CardTitle>
                       <CardDescription>Adjust these sliders to match your region's current conditions</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                       <div className="space-y-3">
                         <div className="flex justify-between items-center">
                           <div className="flex items-center">
                             <Factory className="h-4 w-4 mr-2 text-red-500" />
                             <label htmlFor="carbon-emissions" className="text-sm font-medium">
                               Carbon Emissions
                             </label>
                           </div>
                           <span className="text-sm font-medium">{carbonEmissions[0]}%</span>
                         </div>
                         <Slider
                           id="carbon-emissions"
                           min={0}
                           max={100}
                           step={1}
                           value={carbonEmissions}
                           onValueChange={setCarbonEmissions}
                           className="[&>[role=slider]]:bg-red-500"
                         />
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex justify-between items-center">
                           <div className="flex items-center">
                             <Leaf className="h-4 w-4 mr-2 text-green-500" />
                             <label htmlFor="deforestation" className="text-sm font-medium">
                               Deforestation Rate
                             </label>
                           </div>
                           <span className="text-sm font-medium">{deforestation[0]}%</span>
                         </div>
                         <Slider
                           id="deforestation"
                           min={0}
                           max={100}
                           step={1}
                           value={deforestation}
                           onValueChange={setDeforestation}
                           className="[&>[role=slider]]:bg-amber-500"
                         />
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex justify-between items-center">
                           <div className="flex items-center">
                             <Wind className="h-4 w-4 mr-2 text-blue-500" />
                             <label htmlFor="renewable-energy" className="text-sm font-medium">
                               Renewable Energy Adoption
                             </label>
                           </div>
                           <span className="text-sm font-medium">{renewableEnergy[0]}%</span>
                         </div>
                         <Slider
                           id="renewable-energy"
                           min={0}
                           max={100}
                           step={1}
                           value={renewableEnergy}
                           onValueChange={setRenewableEnergy}
                           className="[&>[role=slider]]:bg-green-500"
                         />
                       </div>
                     </CardContent>
                     <CardFooter>
                       <motion.div
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         className="w-full"
                       >
                         <Button 
                           className="w-full" 
                           onClick={generateAnalysis}
                           disabled={loading || !selectedLocation || (selectedHabits.length === 0 && selectedPolicies.length === 0)}
                         >
                           {loading ? (
                             <span className="flex items-center">
                               <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               Generating Analysis...
                             </span>
                           ) : "Generate Analysis"}
                         </Button>
                       </motion.div>
                     </CardFooter>
                   </Card>
                 </motion.div>
               </motion.div>
               
               {analysis && (
                 <motion.div
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ type: "spring", duration: 0.8 }}
                 >
                   <Card className="mt-6 border-t-4 border-t-amber-500 shadow-lg overflow-hidden">
                     <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/10">
                       <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                         <Globe className="h-5 w-5 mr-2 text-blue-500" />
                         Climate Impact Analysis for {selectedLocation}
                       </CardTitle>
                       <CardDescription className="text-blue-700 dark:text-blue-300/70">
                         Based on your selected habits, policies, and environmental factors
                       </CardDescription>
                     </CardHeader>
                     <CardContent className="pt-6 relative overflow-hidden dark:bg-slate-900/90 dark:text-slate-300">
                       {/* Add a subtle background pattern */}
                       <div className="absolute top-0 right-0 w-full h-full bg-topo-pattern opacity-5"></div>
                       
                       <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40">
                         <AlertTitle className="text-blue-800 dark:text-blue-300 flex items-center">
                           <AlertTriangle className="h-4 w-4 mr-2" />
                           Climate Alert
                         </AlertTitle>
                         <AlertDescription className="text-blue-700 dark:text-blue-300/70">
                           The analysis below is based on current scientific models and may evolve as new data becomes available.
                         </AlertDescription>
                       </Alert>
                       
                       <motion.div
                         variants={containerVariants}
                         initial="hidden"
                         animate="visible"
                         className="prose prose-blue prose-sm max-w-none dark:prose-invert relative"
                       >
                         {(() => {
                           const sections = [];
                           let currentSection = null;
                           let currentSectionContent = [];
                           let sectionIndex = 0;
                           
                           analysis.split('\n\n').forEach((paragraph, index) => {
                             if (paragraph.startsWith('###')) {
                               // If we have a previous section, add it to the results
                               if (currentSection !== null) {
                                 const sectionClass = `analysis-result-section ${currentSection.className}`;
                                 // Determine additional classes based on section type
                                 let additionalClasses = "bg-topo-pattern analysis-card";
                                 let sectionBgClass = "bg-white/5 dark:bg-slate-900/20"; // Unified subtle background
                                 
                                 if (paragraph.includes('Sea Level')) {
                                   additionalClasses += " water-wave-bg";
                                 } else if (paragraph.includes('Biodiversity')) {
                                   additionalClasses += " leaf-pattern-bg";
                                 } else if (paragraph.includes('Temperature')) {
                                   additionalClasses += " section-highlight";
                                 } else if (paragraph.includes('Air Quality')) {
                                   sectionBgClass = "bg-white/5 dark:bg-slate-900/20";
                                 } else if (paragraph.includes('Economic')) {
                                   additionalClasses += " section-highlight";
                                 } else if (paragraph.includes('What You Can Do')) {
                                   sectionBgClass = "bg-white/5 dark:bg-slate-900/20";
                                 } else if (paragraph.includes('Policy Impact')) {
                                   sectionBgClass = "bg-white/5 dark:bg-slate-900/20";
                                 }
                                 
                                 sections.push(
                                   <div 
                                     key={`section-${sectionIndex}`} 
                                     className={`${sectionClass} ${additionalClasses} mb-6 bg-gradient-to-br ${sectionBgClass} p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/50 dark:border-slate-700/30`}
                                   >
                                     {currentSection.title}
                                     <div className="mt-4">
                                       {currentSectionContent}
                                     </div>
                                   </div>
                                 );
                                 sectionIndex++;
                                 currentSectionContent = [];
                               }
                               
                               // Start new section
                               const title = paragraph.replace('###', '').trim();
                               const sectionClass = `analysis-result-section`;
                               let icon = null;
                               let emoji = "";
                               let sectionColor = "";
                               
                               if (paragraph.includes('Temperature')) {
                                 icon = <Thermometer className="h-5 w-5 mr-2 text-red-500" />;
                                 emoji = "🌡️";
                                 sectionColor = "border-l-red-500";
                               } else if (paragraph.includes('Sea Level')) {
                                 icon = <Droplet className="h-5 w-5 mr-2 text-blue-500" />;
                                 emoji = "🌊";
                                 sectionColor = "border-l-blue-500";
                               } else if (paragraph.includes('Biodiversity')) {
                                 icon = <Leaf className="h-5 w-5 mr-2 text-green-500" />;
                                 emoji = "🌿";
                                 sectionColor = "border-l-green-500";
                               } else if (paragraph.includes('Air Quality')) {
                                 icon = <Wind className="h-5 w-5 mr-2 text-purple-500" />;
                                 emoji = "💨";
                                 sectionColor = "border-l-purple-500";
                               } else if (paragraph.includes('Economic')) {
                                 icon = <BarChart2 className="h-5 w-5 mr-2 text-orange-500" />;
                                 emoji = "💰";
                                 sectionColor = "border-l-orange-500";
                               } else if (paragraph.includes('What You Can Do')) {
                                 icon = <User className="h-5 w-5 mr-2 text-emerald-500" />;
                                 emoji = "👤";
                                 sectionColor = "border-l-emerald-500";
                               } else if (paragraph.includes('Policy Impact')) {
                                 icon = <GanttChart className="h-5 w-5 mr-2 text-cyan-500" />;
                                 emoji = "📜";
                                 sectionColor = "border-l-cyan-500";
                               }
                               
                               currentSection = {
                                 className: `${sectionClass} border-l-4 ${sectionColor}`,
                                 title: (
                                   <div className="flex items-center pb-2 border-b border-slate-200/50 dark:border-slate-700/30">
                                     <span className="text-2xl mr-2">{emoji}</span>
                                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                       {title}
                                     </h3>
                                     
                                     {/* Add visual indicator for section importance */}
                                     {title.includes('Temperature') || title.includes('Sea Level') ? (
                                       <span className="ml-auto inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-300">
                                         High Priority
                                       </span>
                                     ) : title.includes('Economic') ? (
                                       <span className="ml-auto inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-300">
                                         Medium Priority
                                       </span>  
                                     ) : title.includes('What You Can Do') ? (
                                       <span className="ml-auto inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                         Action Items
                                       </span>
                                     ) : null}
                                   </div>
                                 )
                               };
                             } else if (paragraph.startsWith('##')) {
                               // Main title outside sections
                               sections.push(
                                 <h2 key={`title-${index}`} className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300 border-b pb-2 border-blue-200 dark:border-blue-800/30">
                                   🌍 {paragraph.replace('##', '').trim()}
                                 </h2>
                               );
                             } else if (currentSection !== null) {
                               // Content within a section
                               const formattedText = paragraph.replace(
                                 /(\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?(?:\s*million|\s*billion)?|\d+(?:\.\d+)?(?:\s*tons|\s*kg|\s*cm|\s*°C))/g,
                                 '<span class="data-point">$1</span>'
                               ).replace(
                                 /(increase|decrease|rise|reduction|impact|risk|projection|stress|effect|adaptation|affect|prevent)/gi,
                                 '<span class="text-purple-600 dark:text-purple-400">$1</span>'
                               );
                               
                               // Add formatted paragraph to content
                               currentSectionContent.push(
                                 <div 
                                   key={`para-${index}`} 
                                   className="analysis-content"
                                   dangerouslySetInnerHTML={{ __html: formattedText }}
                                 />
                               );
                             }
                           });
                           
                           // Add the last section if there is one
                           if (currentSection !== null) {
                             const sectionClass = `analysis-result-section ${currentSection.className}`;
                             // Determine additional classes based on section type
                             let additionalClasses = "bg-topo-pattern analysis-card";
                             let sectionBgClass = "bg-white/5 dark:bg-slate-900/20"; // Unified subtle background
                             
                             // Get the title text to determine section type
                             let titleText = "";
                             try {
                               titleText = currentSection.title.props.children[1].props.children;
                             } catch (e) {
                               console.log("Error getting title text:", e);
                             }
                             
                             if (titleText.includes('Sea Level')) {
                               additionalClasses += " water-wave-bg";
                             } else if (titleText.includes('Biodiversity')) {
                               additionalClasses += " leaf-pattern-bg";
                             } else if (titleText.includes('Temperature')) {
                               additionalClasses += " section-highlight";
                             } else if (titleText.includes('Air Quality')) {
                               sectionBgClass = "bg-white/5 dark:bg-slate-900/20";
                             } else if (titleText.includes('Economic')) {
                               additionalClasses += " section-highlight";
                             } else if (titleText.includes('What You Can Do')) {
                               sectionBgClass = "bg-white/5 dark:bg-slate-900/20";
                             } else if (titleText.includes('Policy Impact')) {
                               sectionBgClass = "bg-white/5 dark:bg-slate-900/20";
                             }
                             
                             sections.push(
                               <div 
                                 key={`section-${sectionIndex}`} 
                                 className={`${sectionClass} ${additionalClasses} mb-6 bg-gradient-to-br ${sectionBgClass} p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/50 dark:border-slate-700/30`}
                               >
                                 {currentSection.title}
                                 <div className="mt-4">
                                   {currentSectionContent}
                                 </div>
                               </div>
                             );
                           }
                           
                           // Enhanced Key Takeaways section
                           if (sections.length > 0) {
                             const cityName = selectedLocation.split(',')[0];
                             sections.push(
                               <div key="summary" className="mt-8 p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/30 dark:bg-slate-800 rounded-lg shadow-md border border-blue-200 dark:border-blue-800/40 overflow-hidden relative section-background">
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 dark:bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                 <h3 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300 flex items-center relative z-10">
                                   <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                   Key Takeaways for {cityName}
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 relative z-10">
                                   {carbonEmissions[0] > 70 && (
                                     <div className="flex items-start bg-white/70 dark:bg-slate-800/70 p-4 rounded-md shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1">
                                       <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                       <div>
                                         <span className="font-medium text-slate-800 dark:text-slate-200">High Carbon Emissions</span>
                                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Urgent action needed to reduce carbon output</p>
                                       </div>
                                     </div>
                                   )}
                                   {deforestation[0] > 50 && (
                                     <div className="flex items-start bg-white/70 dark:bg-slate-800/70 p-4 rounded-md shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1">
                                       <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                       <div>
                                         <span className="font-medium text-slate-800 dark:text-slate-200">Critical Deforestation</span>
                                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Forest conservation and restoration is a priority</p>
                                       </div>
                                     </div>
                                   )}
                                   {renewableEnergy[0] < 30 && (
                                     <div className="flex items-start bg-white/70 dark:bg-slate-800/70 p-4 rounded-md shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1">
                                       <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                       <div>
                                         <span className="font-medium text-slate-800 dark:text-slate-200">Low Renewable Adoption</span>
                                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Significant opportunity to increase clean energy usage</p>
                                       </div>
                                     </div>
                                   )}
                                   <div className="flex items-start bg-white/70 dark:bg-slate-800/70 p-4 rounded-md shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-1">
                                     <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                                     <div>
                                       <span className="font-medium text-slate-800 dark:text-slate-200">Combined Approach Needed</span>
                                       <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Individual actions and policy changes must work together</p>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             );
                           }
                           
                           return sections;
                         })()}
                       </motion.div>
                     </CardContent>
                     
                     <CardFooter className="flex justify-between mt-6">
                       <Button 
                         variant="outline" 
                         onClick={() => setAnalysis(null)} 
                         className="flex items-center"
                       >
                         <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4">
                           <path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" transform="rotate(90 7.5 7.5)"></path>
                         </svg>
                         Back to Inputs
                       </Button>
                       
                       <Button 
                         onClick={generateAnalysis} 
                         className="flex items-center"
                         disabled={loading}
                       >
                         {loading ? (
                           <span className="flex items-center">
                             <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Regenerating...
                           </span>
                         ) : (
                           <>
                             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                               <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                               <path d="M21 3v5h-5"></path>
                               <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                               <path d="M8 16H3v5"></path>
                             </svg>
                             Regenerate Analysis
                           </>
                         )}
                       </Button>
                     </CardFooter>
                     
                   </Card>
                 </motion.div>
               )}
             </>
           )}
         </motion.div>
       </main>
     </div>
   );
 };
 
 export default PersonalizedAnalysis; 