/**
 * Predefined coordinates for Philippine regions/provinces
 * These are manually curated for optimal label positioning
 * Coordinates are based on the SVG viewBox: -20 -20 770 1250
 */

export interface RegionCoordinate {
  x: number;
  y: number;
  name: string;
}

export const regionCoordinates: Record<string, RegionCoordinate> = {
  // Luzon - Northern regions
  "PH-00": { x: 300, y: 50, name: "National Capital Region" },
  "PH-15": { x: 280, y: 80, name: "Cordillera Administrative Region" },
  "PH-01": { x: 320, y: 40, name: "Region I (Ilocos)" },
  "PH-02": { x: 350, y: 70, name: "Region II (Cagayan Valley)" },
  "PH-03": { x: 300, y: 120, name: "Region III (Central Luzon)" },
  "PH-40": { x: 280, y: 160, name: "Region IV-A (CALABARZON)" },
  "PH-41": { x: 220, y: 180, name: "Region IV-B (MIMAROPA)" },
  "PH-05": { x: 320, y: 200, name: "Region V (Bicol)" },

  // Visayas
  "PH-06": { x: 250, y: 320, name: "Region VI (Western Visayas)" },
  "PH-07": { x: 320, y: 340, name: "Region VII (Central Visayas)" },
  "PH-08": { x: 380, y: 360, name: "Region VIII (Eastern Visayas)" },

  // Mindanao
  "PH-09": { x: 280, y: 480, name: "Region IX (Zamboanga Peninsula)" },
  "PH-10": { x: 350, y: 500, name: "Region X (Northern Mindanao)" },
  "PH-11": { x: 380, y: 580, name: "Region XI (Davao)" },
  "PH-12": { x: 320, y: 560, name: "Region XII (SOCCSKSARGEN)" },
  "PH-13": { x: 420, y: 650, name: "Region XIII (Caraga)" },
  "PH-14": { x: 250, y: 650, name: "Region XIV (BARMM)" },

  // Individual provinces - Major ones for better coverage
  "PH-ABR": { x: 350, y: 90, name: "Abra" },
  "PH-AGN": { x: 380, y: 60, name: "Agusan del Norte" },
  "PH-AGS": { x: 400, y: 620, name: "Agusan del Sur" },
  "PH-AKL": { x: 250, y: 300, name: "Aklan" },
  "PH-ALB": { x: 340, y: 220, name: "Albay" },
  "PH-ANT": { x: 270, y: 310, name: "Antique" },
  "PH-APA": { x: 350, y: 60, name: "Apayao" },
  "PH-AUR": { x: 370, y: 80, name: "Aurora" },
  "PH-BAS": { x: 280, y: 160, name: "Bataan" },
  "PH-BAN": { x: 290, y: 140, name: "Batanes" },
  "PH-BTG": { x: 300, y: 170, name: "Batangas" },
  "PH-BEN": { x: 280, y: 90, name: "Benguet" },
  "PH-BIL": { x: 380, y: 400, name: "Biliran" },
  "PH-BOH": { x: 320, y: 350, name: "Bohol" },
  "PH-BTN": { x: 350, y: 140, name: "Bulacan" },
  "PH-CAG": { x: 370, y: 50, name: "Cagayan" },
  "PH-CAN": { x: 250, y: 190, name: "Camarines Norte" },
  "PH-CAS": { x: 270, y: 210, name: "Camarines Sur" },
  "PH-CAM": { x: 320, y: 230, name: "Camiguin" },
  "PH-CAP": { x: 280, y: 300, name: "Capiz" },
  "PH-CAT": { x: 310, y: 240, name: "Catanduanes" },
  "PH-CAV": { x: 290, y: 160, name: "Cavite" },
  "PH-CEB": { x: 330, y: 350, name: "Cebu" },
  "PH-COM": { x: 420, y: 560, name: "Compostela Valley" },
  "PH-DAO": { x: 380, y: 590, name: "Davao del Norte" },
  "PH-DAS": { x: 390, y: 610, name: "Davao del Sur" },
  "PH-DAV": { x: 400, y: 580, name: "Davao Oriental" },
  "PH-DIN": { x: 420, y: 520, name: "Dinagat Islands" },
  "PH-EAS": { x: 400, y: 380, name: "Eastern Samar" },
  "PH-GUI": { x: 270, y: 290, name: "Guimaras" },
  "PH-IFU": { x: 280, y: 80, name: "Ifugao" },
  "PH-ILN": { x: 280, y: 40, name: "Ilocos Norte" },
  "PH-ILS": { x: 290, y: 60, name: "Ilocos Sur" },
  "PH-ILI": { x: 260, y: 320, name: "Iloilo" },
  "PH-ISA": { x: 340, y: 70, name: "Isabela" },
  "PH-KAL": { x: 290, y: 90, name: "Kalinga" },
  "PH-LAG": { x: 310, y: 180, name: "Laguna" },
  "PH-LAN": { x: 250, y: 650, name: "Lanao del Norte" },
  "PH-LAS": { x: 270, y: 680, name: "Lanao del Sur" },
  "PH-LUN": { x: 310, y: 50, name: "La Union" },
  "PH-LEY": { x: 380, y: 380, name: "Leyte" },
  "PH-MAG": { x: 250, y: 660, name: "Maguindanao" },
  "PH-MAD": { x: 170, y: 200, name: "Marinduque" },
  "PH-MAS": { x: 230, y: 210, name: "Masbate" },
  "PH-MDC": { x: 180, y: 180, name: "Mindoro Occidental" },
  "PH-MDR": { x: 200, y: 200, name: "Mindoro Oriental" },
  "PH-MSC": { x: 350, y: 520, name: "Misamis Occidental" },
  "PH-MSR": { x: 370, y: 500, name: "Misamis Oriental" },
  "PH-MOU": { x: 280, y: 100, name: "Mountain Province" },
  "PH-NEC": { x: 280, y: 300, name: "Negros Occidental" },
  "PH-NER": { x: 310, y: 320, name: "Negros Oriental" },
  "PH-NCO": { x: 350, y: 590, name: "North Cotabato" },
  "PH-NSA": { x: 390, y: 360, name: "Northern Samar" },
  "PH-NUE": { x: 320, y: 120, name: "Nueva Ecija" },
  "PH-NUV": { x: 340, y: 100, name: "Nueva Vizcaya" },
  "PH-PAL": { x: 150, y: 250, name: "Palawan" },
  "PH-PAM": { x: 310, y: 130, name: "Pampanga" },
  "PH-PAN": { x: 300, y: 80, name: "Pangasinan" },
  "PH-QUE": { x: 320, y: 160, name: "Quezon" },
  "PH-QUI": { x: 340, y: 90, name: "Quirino" },
  "PH-RIZ": { x: 300, y: 170, name: "Rizal" },
  "PH-ROM": { x: 180, y: 230, name: "Romblon" },
  "PH-SAM": { x: 380, y: 370, name: "Samar" },
  "PH-SAR": { x: 320, y: 230, name: "Sarangani" },
  "PH-SIQ": { x: 300, y: 300, name: "Siquijor" },
  "PH-SOR": { x: 240, y: 220, name: "Sorsogon" },
  "PH-SCO": { x: 320, y: 580, name: "South Cotabato" },
  "PH-SLE": { x: 390, y: 390, name: "Southern Leyte" },
  "PH-SUK": { x: 350, y: 620, name: "Sultan Kudarat" },
  "PH-SLU": { x: 250, y: 700, name: "Sulu" },
  "PH-SUN": { x: 400, y: 640, name: "Surigao del Norte" },
  "PH-SUR": { x: 420, y: 660, name: "Surigao del Sur" },
  "PH-TAR": { x: 310, y: 140, name: "Tarlac" },
  "PH-TAW": { x: 200, y: 750, name: "Tawi-Tawi" },
  "PH-ZMB": { x: 290, y: 460, name: "Zambales" },
  "PH-ZAN": { x: 270, y: 480, name: "Zamboanga del Norte" },
  "PH-ZAS": { x: 280, y: 520, name: "Zamboanga del Sur" },
  "PH-ZSI": { x: 250, y: 550, name: "Zamboanga Sibugay" },
};

/**
 * Get coordinates for a region, with fallback to center of map
 */
export function getRegionCoordinates(regionId: string): RegionCoordinate {
  const coords = regionCoordinates[regionId];
  if (coords) {
    return coords;
  }

  // Fallback for unknown regions - center of Philippines
  return {
    x: 350,
    y: 400,
    name: regionId.replace("PH-", ""),
  };
}
