import { create } from "zustand";
import { nanoid } from "nanoid";
import { measureTextContent } from "./text-measure";
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
  selectedElementIds: string[];
  selectElement: (
    id: string | null,
    options?: { additive?: boolean; toggle?: boolean }
  ) => void;
  setSelectedElements: (ids: string[]) => void;

  addElement: (item: FurnitureCatalogItem, x?: number, y?: number) => void;
  addTextElement: (x: number, y: number) => void;
  updateElement: (id: string, updates: Partial<StandElement>) => void;
  setElementRotation: (id: string, rotation: number) => void;
  moveElement: (id: string, x: number, y: number) => void;
  moveSelectedElements: (deltaX: number, deltaY: number) => void;
  removeElement: (id: string) => void;
  removeSelectedElements: () => void;
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
  selectedElementIds: [],
  selectElement: (id, options) => {
    if (id === null) {
      set({ selectedElementId: null, selectedElementIds: [] });
      return;
    }

    set((state) => {
      const alreadySelected = state.selectedElementIds.includes(id);

      if (options?.toggle) {
        const nextSelectedElementIds = alreadySelected
          ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedElementIds, id];

        return {
          selectedElementIds: nextSelectedElementIds,
          selectedElementId:
            nextSelectedElementIds.length > 0
              ? nextSelectedElementIds[nextSelectedElementIds.length - 1]
              : null,
        };
      }

      if (options?.additive) {
        const nextSelectedElementIds = alreadySelected
          ? state.selectedElementIds
          : [...state.selectedElementIds, id];

        return {
          selectedElementIds: nextSelectedElementIds,
          selectedElementId: id,
        };
      }

      return {
        selectedElementId: id,
        selectedElementIds: [id],
      };
    });
  },
  setSelectedElements: (ids) => {
    const normalizedIds = Array.from(new Set(ids));

    set({
      selectedElementIds: normalizedIds,
      selectedElementId:
        normalizedIds.length > 0
          ? normalizedIds[normalizedIds.length - 1]
          : null,
    });
  },

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
      selectedElementIds: [el.id],
    }));
  },

  addTextElement: (x, y) => {
    if (get().isReadOnly) return;
    get().pushHistory();
    const defaultText = "Texte";
    const textSize = measureTextContent({
      text: defaultText,
      fontSize: 18 * 0.8,
    });
    const el: StandElement = {
      id: nanoid(8),
      catalogId: "text",
      name: "Texte",
      category: "texte",
      x,
      y,
      width: textSize.widthPx / 100,
      height: textSize.heightPx / 100,
      rotation: 0,
      color: "#1a1a2e",
      locked: false,
      text: defaultText,
      fontSize: 18,
      fontBold: false,
      fontItalic: false,
    };
    set((s) => ({
      elements: [...s.elements, el],
      selectedElementId: el.id,
      selectedElementIds: [el.id],
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

  setElementRotation: (id, rotation) => {
    if (get().isReadOnly) return;

    const normalizedRotation = ((rotation % 360) + 360) % 360;

    set((state) => ({
      elements: state.elements.map((element) =>
        element.id === id
          ? { ...element, rotation: normalizedRotation }
          : element
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

  moveSelectedElements: (deltaX, deltaY) => {
    if (get().isReadOnly) return;

    const { elements, selectedElementIds, dimensions } = get();
    const selectedSet = new Set(selectedElementIds);
    const selectedElements = elements.filter((element) => selectedSet.has(element.id));

    if (selectedElements.length === 0) {
      return;
    }

    const minX = Math.min(...selectedElements.map((element) => element.x));
    const minY = Math.min(...selectedElements.map((element) => element.y));
    const maxX = Math.max(...selectedElements.map((element) => element.x + element.width));
    const maxY = Math.max(...selectedElements.map((element) => element.y + element.height));

    const constrainedDeltaX = Math.max(-minX, Math.min(deltaX, dimensions.width - maxX));
    const constrainedDeltaY = Math.max(-minY, Math.min(deltaY, dimensions.depth - maxY));

    set((state) => ({
      elements: state.elements.map((element) =>
        selectedSet.has(element.id)
          ? {
              ...element,
              x: element.x + constrainedDeltaX,
              y: element.y + constrainedDeltaY,
            }
          : element
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
      selectedElementIds: s.selectedElementIds.filter((selectedId) => selectedId !== id),
    }));
  },

  removeSelectedElements: () => {
    if (get().isReadOnly) return;

    const selectedSet = new Set(get().selectedElementIds);
    if (selectedSet.size === 0) {
      return;
    }

    get().pushHistory();
    set((state) => ({
      elements: state.elements.filter((element) => !selectedSet.has(element.id)),
      selectedElementId: null,
      selectedElementIds: [],
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
      selectedElementIds: [dup.id],
    }));
  },

  clearElements: () => {
    if (get().isReadOnly) return;
    get().pushHistory();
    set({ elements: [], selectedElementId: null, selectedElementIds: [] });
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
      selectedElementIds: [],
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
      selectedElementIds: [],
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
      selectedElementIds: [],
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
