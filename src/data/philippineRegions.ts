import { PhilippineRegion } from "@/types/map";

/**
 * Simplified SVG path data for Philippine regions
 * This is a basic representation - in production, you'd want more detailed city-level data
 * Each region represents major administrative divisions for demonstration
 */
export const philippineRegions: PhilippineRegion[] = [
  {
    id: "ncr",
    name: "National Capital Region (Metro Manila)",
    pathData: "M480,420 L520,420 L520,450 L480,450 Z",
    center: { x: 500, y: 435 },
  },
  {
    id: "car",
    name: "Cordillera Administrative Region",
    pathData: "M440,340 L500,340 L500,380 L460,390 L440,380 Z",
    center: { x: 470, y: 365 },
  },
  {
    id: "region1",
    name: "Ilocos Region (Region I)",
    pathData: "M420,300 L460,300 L460,350 L430,360 L420,340 Z",
    center: { x: 440, y: 330 },
  },
  {
    id: "region2",
    name: "Cagayan Valley (Region II)",
    pathData: "M460,280 L520,280 L520,330 L480,340 L460,320 Z",
    center: { x: 490, y: 310 },
  },
  {
    id: "region3",
    name: "Central Luzon (Region III)",
    pathData: "M450,380 L510,380 L510,420 L450,420 Z",
    center: { x: 480, y: 400 },
  },
  {
    id: "region4a",
    name: "CALABARZON (Region IV-A)",
    pathData: "M480,450 L540,450 L540,500 L480,500 Z",
    center: { x: 510, y: 475 },
  },
  {
    id: "region4b",
    name: "MIMAROPA (Region IV-B)",
    pathData: "M420,480 L480,480 L480,540 L420,540 Z",
    center: { x: 450, y: 510 },
  },
  {
    id: "region5",
    name: "Bicol Region (Region V)",
    pathData: "M540,480 L600,480 L620,520 L560,540 L540,520 Z",
    center: { x: 580, y: 510 },
  },
  {
    id: "region6",
    name: "Western Visayas (Region VI)",
    pathData: "M380,580 L450,580 L450,630 L380,630 Z",
    center: { x: 415, y: 605 },
  },
  {
    id: "region7",
    name: "Central Visayas (Region VII)",
    pathData: "M450,580 L520,580 L520,630 L450,630 Z",
    center: { x: 485, y: 605 },
  },
  {
    id: "region8",
    name: "Eastern Visayas (Region VIII)",
    pathData: "M520,580 L590,580 L590,630 L520,630 Z",
    center: { x: 555, y: 605 },
  },
  {
    id: "region9",
    name: "Zamboanga Peninsula (Region IX)",
    pathData: "M320,680 L380,680 L380,740 L320,740 Z",
    center: { x: 350, y: 710 },
  },
  {
    id: "region10",
    name: "Northern Mindanao (Region X)",
    pathData: "M420,660 L490,660 L490,710 L420,710 Z",
    center: { x: 455, y: 685 },
  },
  {
    id: "region11",
    name: "Davao Region (Region XI)",
    pathData: "M490,710 L560,710 L560,780 L490,780 Z",
    center: { x: 525, y: 745 },
  },
  {
    id: "region12",
    name: "SOCCSKSARGEN (Region XII)",
    pathData: "M420,720 L490,720 L490,780 L420,780 Z",
    center: { x: 455, y: 750 },
  },
  {
    id: "region13",
    name: "Caraga (Region XIII)",
    pathData: "M560,660 L620,660 L620,720 L560,720 Z",
    center: { x: 590, y: 690 },
  },
  {
    id: "barmm",
    name: "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
    pathData: "M320,740 L420,740 L420,800 L320,800 Z",
    center: { x: 370, y: 770 },
  },
];

/**
 * Get region color based on visit status
 */
export const getRegionColor = (status: string): string => {
  switch (status) {
    case "been-there":
      return "fill-green-500 hover:fill-green-600";
    case "stayed-there":
      return "fill-blue-500 hover:fill-blue-600";
    case "passed-by":
      return "fill-yellow-500 hover:fill-yellow-600";
    case "not-visited":
    default:
      return "fill-gray-300 hover:fill-gray-400";
  }
};

/**
 * Get region stroke color for better visibility
 */
export const getRegionStroke = (status: string): string => {
  switch (status) {
    case "been-there":
      return "stroke-green-700";
    case "stayed-there":
      return "stroke-blue-700";
    case "passed-by":
      return "stroke-yellow-700";
    case "not-visited":
    default:
      return "stroke-gray-500";
  }
};
