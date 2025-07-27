/**
 * Type definitions for the Philippine Interactive Map
 */

export type VisitStatus =
  | "been-there"
  | "stayed-there"
  | "passed-by"
  | "not-visited";

export interface PhilippineRegion {
  id: string;
  name: string;
  pathData: string;
  center?: { x: number; y: number };
  status?: VisitStatus;
}

export interface MapState {
  [regionId: string]: VisitStatus;
}

export interface MapStats {
  beenThere: number;
  stayedThere: number;
  passedBy: number;
  notVisited: number;
  total: number;
}
