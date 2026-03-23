import { create } from "zustand";
import { nanoid } from "nanoid";
import { StandElement, StandDimensions, GridSize, FurnitureCatalogItem } from "./types";

interface HistoryEntry {
  elements: StandElement[];
  dimensions: StandDimensions;
}

interface StandStore {
  // Stand dimensions
  dimensions: StandDimensions;
  setDimensions: (d: StandDimensions) => void;

  // Elements
  elements: StandElement[];
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;

  addElement: (item: FurnitureCatalogItem, x?: number, y?: number) => void;
  addTextElement: (x: number, y: number) => void;
  updateElement: (id: string, updates: Partial<StandElement>) => void;
  moveElement: (id: string, x: number, y: number) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  clearElements: () => void;

  // Grid
  showGrid: boolean;
  gridSize: GridSize;
  toggleGrid: () => void;
  setGridSize: (size: GridSize) => void;

  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Share
  planId: string;
  planName: string;
  setPlanName: (name: string) => void;
}

const DEFAULT_DIMENSIONS: StandDimensions = { width: 6, depth: 5 };

export const useStandStore = create<StandStore>((set, get) => ({
  dimensions: { ...DEFAULT_DIMENSIONS },
  setDimensions: (d) => {
    get().pushHistory();
    set({ dimensions: d });
  },

  elements: [],
  selectedElementId: null,
  selectElement: (id) => set({ selectedElementId: id }),

  addElement: (item, x, y) => {
    get().pushHistory();
    const { dimensions } = get();
    const el: StandElement = {
      id: nanoid(8),
      catalogId: item.id,
      name: item.name,
      category: item.category,
      x: x ?? (dimensions.width - item.width) / 2,
      y: y ?? (dimensions.depth - item.height) / 2,
      width: item.width,
      height: item.height,
      rotation: 0,
      color: item.color,
      locked: false,
    };
    set((s) => ({
      elements: [...s.elements, el],
      selectedElementId: el.id,
    }));
  },

  addTextElement: (x, y) => {
    get().pushHistory();
    const el: StandElement = {
      id: nanoid(8),
      catalogId: "text",
      name: "Texte",
      category: "texte",
      x,
      y,
      width: 1,
      height: 0.4,
      rotation: 0,
      color: "#1a1a2e",
      locked: false,
      text: "Texte",
      fontSize: 18,
      fontBold: false,
      fontItalic: false,
    };
    set((s) => ({
      elements: [...s.elements, el],
      selectedElementId: el.id,
    }));
  },

  updateElement: (id, updates) => {
    get().pushHistory();
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  moveElement: (id, x, y) => {
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id ? { ...e, x, y } : e
      ),
    }));
  },

  removeElement: (id) => {
    get().pushHistory();
    set((s) => ({
      elements: s.elements.filter((e) => e.id !== id),
      selectedElementId:
        s.selectedElementId === id ? null : s.selectedElementId,
    }));
  },

  duplicateElement: (id) => {
    const el = get().elements.find((e) => e.id === id);
    if (!el) return;
    get().pushHistory();
    const dup: StandElement = {
      ...el,
      id: nanoid(8),
      x: el.x + 0.3,
      y: el.y + 0.3,
      locked: false,
    };
    set((s) => ({
      elements: [...s.elements, dup],
      selectedElementId: dup.id,
    }));
  },

  clearElements: () => {
    get().pushHistory();
    set({ elements: [], selectedElementId: null });
  },

  showGrid: true,
  gridSize: 5,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setGridSize: (size) => set({ gridSize: size }),

  history: [],
  historyIndex: -1,
  pushHistory: () => {
    const { elements, dimensions, history, historyIndex } = get();
    const entry: HistoryEntry = {
      elements: JSON.parse(JSON.stringify(elements)),
      dimensions: { ...dimensions },
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);
    // Keep max 50 entries
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < 0) return;
    const entry = history[historyIndex];
    set({
      elements: JSON.parse(JSON.stringify(entry.elements)),
      dimensions: { ...entry.dimensions },
      historyIndex: historyIndex - 1,
      selectedElementId: null,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    set({
      elements: JSON.parse(JSON.stringify(entry.elements)),
      dimensions: { ...entry.dimensions },
      historyIndex: historyIndex + 1,
      selectedElementId: null,
    });
  },

  planId: "",
  planName: "Plan de Stand",
  setPlanName: (name) => set({ planName: name }),
}));

// Initialize planId on client side only
if (typeof window !== "undefined" && useStandStore.getState().planId === "") {
  useStandStore.setState({ planId: nanoid(10) });
}
