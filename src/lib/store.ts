import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  StandElement,
  StandDimensions,
  GridSize,
  FurnitureCatalogItem,
  HistoryEntry,
  StandPlan,
} from "./types";

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
  isReadOnly: boolean;
  setReadOnly: (value: boolean) => void;
  planId: string;
  setPlanId: (planId: string) => void;
  planName: string;
  setPlanName: (name: string) => void;
  replacePlan: (plan: StandPlan) => void;
  serializePlan: () => StandPlan;
}

const DEFAULT_DIMENSIONS: StandDimensions = { width: 6, depth: 5 };

export const useStandStore = create<StandStore>((set, get) => ({
  dimensions: { ...DEFAULT_DIMENSIONS },
  setDimensions: (d) => {
    if (get().isReadOnly) return;
    get().pushHistory();
    set({ dimensions: d });
  },

  elements: [],
  selectedElementId: null,
  selectElement: (id) => set({ selectedElementId: id }),

  addElement: (item, x, y) => {
    if (get().isReadOnly) return;
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
    if (get().isReadOnly) return;
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
    if (get().isReadOnly) return;
    get().pushHistory();
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  moveElement: (id, x, y) => {
    if (get().isReadOnly) return;
    set((s) => ({
      elements: s.elements.map((e) =>
        e.id === id ? { ...e, x, y } : e
      ),
    }));
  },

  removeElement: (id) => {
    if (get().isReadOnly) return;
    get().pushHistory();
    set((s) => ({
      elements: s.elements.filter((e) => e.id !== id),
      selectedElementId:
        s.selectedElementId === id ? null : s.selectedElementId,
    }));
  },

  duplicateElement: (id) => {
    if (get().isReadOnly) return;
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
    if (get().isReadOnly) return;
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
    if (get().isReadOnly) return;
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
    if (get().isReadOnly) return;
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
    if (get().isReadOnly) return;
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

  isReadOnly: false,
  setReadOnly: (value) => set({ isReadOnly: value }),
  planId: "",
  setPlanId: (planId) => set({ planId }),
  planName: "Plan de Stand",
  setPlanName: (name) => {
    if (get().isReadOnly) return;
    set({ planName: name });
  },

  replacePlan: (plan) => {
    set({
      planId: plan.planId,
      planName: plan.planName,
      dimensions: { ...plan.dimensions },
      elements: JSON.parse(JSON.stringify(plan.elements)),
      history: JSON.parse(JSON.stringify(plan.history ?? [])),
      historyIndex:
        typeof plan.historyIndex === "number"
          ? plan.historyIndex
          : (plan.history?.length ?? 0) - 1,
      selectedElementId: null,
    });
  },

  serializePlan: () => {
    const { planId, planName, dimensions, elements, history, historyIndex } = get();

    return {
      planId,
      planName,
      dimensions: { ...dimensions },
      elements: JSON.parse(JSON.stringify(elements)),
      history: JSON.parse(JSON.stringify(history)),
      historyIndex,
    };
  },
}));

// Initialize planId on client side only
if (typeof window !== "undefined" && useStandStore.getState().planId === "") {
  useStandStore.setState({ planId: nanoid(10) });
}
