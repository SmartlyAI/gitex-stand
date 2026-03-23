export type FurnitureCategory =
  | "bars_comptoirs"
  | "assises"
  | "tables"
  | "ecrans_supports"
  | "decoration"
  | "texte";

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  width: number; // in meters
  height: number; // in meters (depth on plan)
  color: string;
  icon?: string;
}

export interface StandElement {
  id: string;
  catalogId: string;
  name: string;
  category: FurnitureCategory;
  x: number; // in meters
  y: number; // in meters
  width: number; // in meters
  height: number; // in meters
  rotation: number; // in degrees
  color: string;
  locked: boolean;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
  text?: string; // for text elements
}

export interface StandDimensions {
  width: number; // in meters
  depth: number; // in meters
}

export type StandViewMode = "2d" | "3d";

export interface HistoryEntry {
  elements: StandElement[];
  dimensions: StandDimensions;
}

export interface StandPlan {
  planId: string;
  planName: string;
  dimensions: StandDimensions;
  elements: StandElement[];
  history: HistoryEntry[];
  historyIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export type StandPreset = "6x5" | "6x6" | "6x6b";

export interface ShareSettings {
  mode: "readonly" | "editor";
  planId: string;
}

export type GridSize = 5 | 10 | 20; // in cm
