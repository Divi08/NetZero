
import { Case, CaseCard } from "./CaseCard";

const mockCases: Case[] = [
  {
    id: "case-1",
    title: "Methane Leaks in Natural Gas Infrastructure",
    summary: "Satellite imagery has detected anomalous methane emissions in a major natural gas pipeline network. Data shows consistent leakage patterns over the past three months.",
    category: "Greenhouse Gas Emissions",
    timestamp: "2 hours ago",
  },
  {
    id: "case-2",
    title: "Industrial Carbon Emissions Violations",
    summary: "Carbon monitoring stations around the industrial zone are showing dangerous levels of greenhouse gas emissions. Data suggests systematic violation of carbon caps.",
    category: "Carbon Footprint",
    timestamp: "5 hours ago",
  },
  {
    id: "case-3",
    title: "Arctic Permafrost Thawing Acceleration",
    summary: "Satellite imagery reveals systematic permafrost thawing at rates far exceeding climate models. Local temperature anomalies suggest potential methane release.",
    category: "Carbon Feedback Loops",
    timestamp: "1 day ago",
  },
  {
    id: "case-4",
    title: "Rising Sea Levels in Pacific Islands",
    summary: "Monitoring has identified accelerated sea level rise in several Pacific island nations. Initial estimates suggest faster than predicted inundation of coastal areas.",
    category: "Climate Impact",
    timestamp: "1 day ago",
  },
  {
    id: "case-5",
    title: "Carbon Offset Program Verification Issues",
    summary: "Investigation into whether a major corporation's carbon offset investments are actually resulting in the claimed carbon sequestration.",
    category: "Climate Policy",
    timestamp: "2 days ago",
  },
  {
    id: "case-6",
    title: "Glacier Melt Rate Acceleration",
    summary: "Monitoring shows elevated rates of ice loss in major glacial systems. Temperature analysis shows concerning warming trends in high-altitude regions.",
    category: "Ice Melt",
    timestamp: "3 days ago",
  },
];

export function CaseList() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {mockCases.map((caseItem) => (
        <CaseCard key={caseItem.id} caseData={caseItem} />
      ))}
    </div>
  );
}
