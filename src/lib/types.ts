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

export type StandAssetKind = "logo" | "parquet_texture";

export interface StandAssetReference {
  assetId: string;
  contentType: string;
  filename: string;
  kind: StandAssetKind;
  url: string;
}

export type TvScreenMode = "single" | "double";

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
  tvScreenMode?: TvScreenMode;
  tvScreen1Inches?: number;
  tvScreen2Inches?: number;
  tvScreen1CenterY?: number;
  tvScreen2CenterY?: number;
  logoFrameHeight?: number;
  logoAsset?: StandAssetReference | null;
  storageOrientation?: "left" | "right"; // Orientation du rangement (ex: tables de démo)
  ledColor?: string; // Couleur de la LED spécifique à l'objet (ex: mini bar)
}

export interface StandDimensions {
  width: number; // in meters
  depth: number; // in meters
}

export type StandFloorFinish = "sol_uni" | "moquette" | "parquet";

export interface StandFloorSettings {
  finish: StandFloorFinish;
  color: string;
  elevation: number;
  textureAsset?: StandAssetReference | null;
  ledColor?: string;
}

export type StandViewMode = "2d" | "3d";

export interface HistoryEntry {
  elements: StandElement[];
  dimensions: StandDimensions;
  floorSettings: StandFloorSettings;
}

export interface StandPlan {
  planId: string;
  planName: string;
  dimensions: StandDimensions;
  floorSettings: StandFloorSettings;
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
