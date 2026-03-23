"use client";

import React, { useState } from "react";
import { useStandStore } from "@/lib/store";
import { savePlanToApi } from "@/lib/plan-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Undo2,
  Redo2,
  Grid3X3,
  Type,
  Image as ImageIcon,
  Save,
  Share2,
} from "lucide-react";
import { GridSize, StandViewMode } from "@/lib/types";

interface ToolbarProps {
  onShareOpen: () => void;
  viewMode: StandViewMode;
  onViewModeChange: (mode: StandViewMode) => void;
}

export function Toolbar({ onShareOpen, viewMode, onViewModeChange }: ToolbarProps) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    undo,
    redo,
    historyIndex,
    history,
    showGrid,
    toggleGrid,
    gridSize,
    setGridSize,
    planName,
    setPlanName,
    planId,
    addTextElement,
    dimensions,
    isReadOnly,
    serializePlan,
  } = useStandStore();

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;
  const viewModes: StandViewMode[] = ["2d", "3d"];

  const handleSavePlan = async () => {
    if (isReadOnly || !planId) return;

    try {
      setIsSaving(true);
      await savePlanToApi(serializePlan());
    } catch {
      alert("Impossible de sauvegarder le plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSVG = () => {
    const state = useStandStore.getState();
    const w = state.dimensions.width * 100;
    const h = state.dimensions.depth * 100;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
    svgContent += `<rect width="${w}" height="${h}" fill="white" stroke="#ccc" stroke-width="1"/>`;

    for (const el of state.elements) {
      const ex = el.x * 100;
      const ey = el.y * 100;
      const ew = el.width * 100;
      const eh = el.height * 100;

      if (el.category === "texte") {
        svgContent += `<text x="${ex + ew / 2}" y="${ey + eh / 2}" text-anchor="middle" dominant-baseline="middle" fill="${el.color}" font-size="${el.fontSize ?? 18}" ${el.fontBold ? 'font-weight="bold"' : ""} ${el.fontItalic ? 'font-style="italic"' : ""} transform="rotate(${el.rotation} ${ex + ew / 2} ${ey + eh / 2})">${el.text ?? ""}</text>`;
      } else {
        svgContent += `<g transform="rotate(${el.rotation} ${ex + ew / 2} ${ey + eh / 2})">`;
        svgContent += `<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="${el.color}" rx="3"/>`;
        svgContent += `<text x="${ex + ew / 2}" y="${ey + eh / 2 - 4}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">${el.name}</text>`;
        svgContent += `<text x="${ex + ew / 2}" y="${ey + eh / 2 + 8}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="8" opacity="0.7">${el.width}×${el.height}m</text>`;
        svgContent += `</g>`;
      }
    }

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${planName.replace(/\s+/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddText = () => {
    addTextElement(dimensions.width / 2 - 0.5, dimensions.depth / 2 - 0.2);
  };

  const gridSizes: GridSize[] = [5, 10, 20];

  return (
    <div className="h-11 border-b border-[#e5e7eb] bg-white flex items-center px-3 gap-1.5 shrink-0">
      {/* Plan name */}
      <div className="flex items-center gap-2 mr-1">
        <input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          readOnly={isReadOnly}
          className="text-[13px] font-semibold text-[#1e293b] bg-transparent border-none outline-none w-28 hover:bg-[#f1f5f9] px-1.5 py-1 rounded-md transition-colors"
        />
      </div>

      <Separator orientation="vertical" className="h-5 bg-[#e2e8f0]" />

      {/* Undo / Redo */}
      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9]" disabled={isReadOnly || !canUndo} onClick={undo} title="Annuler">
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9]" disabled={isReadOnly || !canRedo} onClick={redo} title="Rétablir">
        <Redo2 className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5 bg-[#e2e8f0]" />

      {/* Grid toggle */}
      <Button
        variant={showGrid ? "secondary" : "ghost"}
        size="icon"
        className={`h-7 w-7 ${showGrid ? "bg-[#f1f5f9] text-[#1e293b]" : "text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9]"}`}
        onClick={toggleGrid}
        title="Grille"
      >
        <Grid3X3 className="h-3.5 w-3.5" />
      </Button>

      {/* Grid size selector */}
      <div className="flex items-center gap-0.5 mx-0.5">
        {gridSizes.map((s) => (
          <button
            key={s}
            className={`h-6 px-2 text-[10px] font-medium rounded-md transition-colors ${
              gridSize === s
                ? "bg-[#1e293b] text-white"
                : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#334155]"
            }`}
            onClick={() => setGridSize(s)}
          >
            {s} cm
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-5 bg-[#e2e8f0]" />

      <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-0.5">
        {viewModes.map((mode) => (
          <button
            key={mode}
            type="button"
            className={`h-6 min-w-9 rounded-md px-2 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              viewMode === mode
                ? "bg-[#1e293b] text-white shadow-sm"
                : "text-[#64748b] hover:bg-white hover:text-[#334155]"
            }`}
            onClick={() => onViewModeChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-5 bg-[#e2e8f0]" />

      {/* Text tool */}
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px] font-medium text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9]" onClick={handleAddText} title="Ajouter un texte">
        <Type className="h-3.5 w-3.5" />
        Texte
      </Button>

      <div className="flex-1" />

      {/* Export SVG */}
      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9]" onClick={handleExportSVG} title="SVG">
        <ImageIcon className="h-3.5 w-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5 bg-[#e2e8f0]" />

      {/* Save */}
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px] font-medium text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9]" onClick={handleSavePlan} title="Sauvegarder" disabled={isReadOnly || isSaving}>
        <Save className="h-3.5 w-3.5" />
        {isSaving ? "Sauvegarde..." : "Sauvegarder"}
      </Button>

      {/* Share */}
      <Button
        size="sm"
        className="h-7 gap-1.5 text-[11px] font-semibold bg-[#10b981] hover:bg-[#059669] text-white rounded-lg shadow-sm ml-1"
        onClick={onShareOpen}
        disabled={isReadOnly}
      >
        <Share2 className="h-3.5 w-3.5" />
        Partager
      </Button>
    </div>
  );
}
