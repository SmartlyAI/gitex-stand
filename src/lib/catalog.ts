import { FurnitureCatalogItem, FurnitureCategory } from "./types";

export interface CatalogCategory {
  id: FurnitureCategory;
  label: string;
  items: FurnitureCatalogItem[];
}

export const catalog: CatalogCategory[] = [
  {
    id: "bars_comptoirs",
    label: "Bar & Comptoirs",
    items: [
      {
        id: "bar_central",
        name: "Bar central",
        category: "bars_comptoirs",
        width: 2.5,
        height: 1.2,
        color: "#8B6914",
      },
      {
        id: "comptoir_accueil",
        name: "Comptoir d'accueil",
        category: "bars_comptoirs",
        width: 1.2,
        height: 0.6,
        color: "#2C3E50",
      },
    ],
  },
  {
    id: "assises",
    label: "Assises",
    items: [
      {
        id: "canape",
        name: "Canapé",
        category: "assises",
        width: 2,
        height: 0.8,
        color: "#5D6D7E",
      },
      {
        id: "fauteuil",
        name: "Fauteuil",
        category: "assises",
        width: 0.7,
        height: 0.7,
        color: "#5D6D7E",
      },
      {
        id: "tabouret_haut",
        name: "Tabouret haut",
        category: "assises",
        width: 0.4,
        height: 0.4,
        color: "#34495E",
      },
      {
        id: "pouf",
        name: "Pouf",
        category: "assises",
        width: 0.5,
        height: 0.5,
        color: "#7F8C8D",
      },
    ],
  },
  {
    id: "tables",
    label: "Tables",
    items: [
      {
        id: "table_demo",
        name: "Table de démo",
        category: "tables",
        width: 1.5,
        height: 0.8,
        color: "#2C3E50",
      },
      {
        id: "table_haute",
        name: "Table Haute / Mange-debout",
        category: "tables",
        width: 0.6,
        height: 0.6,
        color: "#34495E",
      },
      {
        id: "table_basse",
        name: "Table basse",
        category: "tables",
        width: 1,
        height: 0.6,
        color: "#5D6D7E",
      },
    ],
  },
  {
    id: "ecrans_supports",
    label: "Écrans & Supports",
    items: [
      {
        id: "ecran_pied",
        name: "Écran sur pied",
        category: "ecrans_supports",
        width: 0.6,
        height: 0.4,
        color: "#1A1A2E",
      },
      {
        id: "totem",
        name: "Totem",
        category: "ecrans_supports",
        width: 0.4,
        height: 0.4,
        color: "#16213E",
      },
      {
        id: "mur_image",
        name: "Mur d'image",
        category: "ecrans_supports",
        width: 3,
        height: 0.3,
        color: "#0F3460",
      },
    ],
  },
  {
    id: "decoration",
    label: "Décoration",
    items: [
      {
        id: "plante",
        name: "Plante",
        category: "decoration",
        width: 0.5,
        height: 0.5,
        color: "#27AE60",
      },
      {
        id: "tapis",
        name: "Tapis",
        category: "decoration",
        width: 2,
        height: 1.5,
        color: "#BDC3C7",
      },
    ],
  },
];
