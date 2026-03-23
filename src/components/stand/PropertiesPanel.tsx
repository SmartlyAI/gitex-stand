"use client";

import React from "react";
import { useStandStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  RotateCw,
  Copy,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";

const PRESETS: { label: string; w: number; d: number }[] = [
  { label: "6×5m", w: 6, d: 5 },
  { label: "6×6m", w: 6, d: 6 },
  { label: "8×6m", w: 8, d: 6 },
];

export function PropertiesPanel() {
  const {
    dimensions,
    setDimensions,
    elements,
    selectedElementId,
    updateElement,
    removeElement,
    duplicateElement,
  } = useStandStore();

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  const catalogLabel = selectedElement
    ? getCategoryLabel(selectedElement.category)
    : null;

  return (
    <div className="w-72 border-l border-[#e5e7eb] bg-white flex flex-col h-full overflow-y-auto">
      {/* Stand Dimensions */}
      <div className="px-4 pt-4 pb-3 border-b border-[#e5e7eb]">
        <h3 className="font-semibold text-[13px] text-[#1e293b] mb-3">Dimensions du stand</h3>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[11px] text-[#64748b]">Largeur :</Label>
              <span className="text-[12px] font-semibold text-[#1e293b]">{dimensions.width}m</span>
            </div>
            <Slider
              value={dimensions.width}
              min={3}
              max={12}
              step={0.5}
              onValueChange={(v: number) =>
                setDimensions({ ...dimensions, width: v })
              }
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-[11px] text-[#64748b]">Profondeur :</Label>
              <span className="text-[12px] font-semibold text-[#1e293b]">{dimensions.depth}m</span>
            </div>
            <Slider
              value={dimensions.depth}
              min={3}
              max={12}
              step={0.5}
              onValueChange={(v: number) =>
                setDimensions({ ...dimensions, depth: v })
              }
            />
          </div>
        </div>

        <div className="flex gap-1.5 mt-3">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className={`flex-1 h-7 text-[11px] font-medium rounded-lg transition-colors ${
                dimensions.width === p.w && dimensions.depth === p.d
                  ? "bg-[#1e293b] text-white"
                  : "border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
              }`}
              onClick={() => setDimensions({ width: p.w, depth: p.d })}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Element Properties */}
      {selectedElement ? (
        <div className="px-4 pt-4 pb-4 flex-1">
          <h3 className="font-semibold text-[13px] text-[#1e293b]">{selectedElement.name}</h3>
          {catalogLabel && (
            <p className="text-[11px] text-[#94a3b8] mb-3">
              {catalogLabel}
            </p>
          )}

          <div className="space-y-3">
            {/* Name */}
            <div>
              <Label className="text-[11px] text-[#64748b]">Nom</Label>
              <Input
                value={selectedElement.name}
                onChange={(e) =>
                  updateElement(selectedElement.id, { name: e.target.value })
                }
                className="h-7 text-[12px] mt-1 border-[#e2e8f0] bg-[#f8f9fb]"
              />
            </div>

            {/* Text content */}
            {selectedElement.category === "texte" && (
              <>
                <div>
                  <Label className="text-[11px] text-[#64748b]">Contenu</Label>
                  <Input
                    value={selectedElement.text ?? ""}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { text: e.target.value })
                    }
                    className="h-7 text-[12px] mt-1 border-[#e2e8f0] bg-[#f8f9fb]"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-[#64748b]">Taille de police</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[14, 16, 18, 24, 28, 36, 48].map((s) => (
                      <button
                        key={s}
                        className={`h-6 px-2 text-[10px] font-medium rounded-md transition-colors ${
                          selectedElement.fontSize === s
                            ? "bg-[#1e293b] text-white"
                            : "border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
                        }`}
                        onClick={() => updateElement(selectedElement.id, { fontSize: s })}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-[#64748b]">Style</Label>
                  <div className="flex gap-2 mt-1">
                    <button
                      className={`h-6 px-3 text-[10px] font-bold rounded-md transition-colors ${
                        selectedElement.fontBold
                          ? "bg-[#1e293b] text-white"
                          : "border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
                      }`}
                      onClick={() => updateElement(selectedElement.id, { fontBold: !selectedElement.fontBold })}
                    >
                      Gras
                    </button>
                    <button
                      className={`h-6 px-3 text-[10px] italic rounded-md transition-colors ${
                        selectedElement.fontItalic
                          ? "bg-[#1e293b] text-white"
                          : "border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
                      }`}
                      onClick={() => updateElement(selectedElement.id, { fontItalic: !selectedElement.fontItalic })}
                    >
                      Italique
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[11px] text-[#64748b]">Largeur</Label>
                  <span className="text-[10px] font-semibold text-[#1e293b]">{selectedElement.width.toFixed(2)}m</span>
                </div>
                <Slider
                  value={selectedElement.width}
                  min={0.2}
                  max={5}
                  step={0.1}
                  onValueChange={(v: number) => updateElement(selectedElement.id, { width: v })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[11px] text-[#64748b]">Profondeur</Label>
                  <span className="text-[10px] font-semibold text-[#1e293b]">{selectedElement.height.toFixed(2)}m</span>
                </div>
                <Slider
                  value={selectedElement.height}
                  min={0.2}
                  max={5}
                  step={0.1}
                  onValueChange={(v: number) => updateElement(selectedElement.id, { height: v })}
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-[11px] text-[#64748b]">Rotation</Label>
                <span className="text-[10px] font-semibold text-[#1e293b]">{selectedElement.rotation}°</span>
              </div>
              <Slider
                value={selectedElement.rotation}
                min={0}
                max={360}
                step={5}
                onValueChange={(v: number) => updateElement(selectedElement.id, { rotation: v })}
              />
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-[#64748b]">X (m)</Label>
                <Input
                  type="number"
                  step={0.05}
                  value={selectedElement.x}
                  onChange={(e) => updateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-[12px] mt-1 border-[#e2e8f0] bg-[#f8f9fb]"
                />
              </div>
              <div>
                <Label className="text-[11px] text-[#64748b]">Y (m)</Label>
                <Input
                  type="number"
                  step={0.05}
                  value={selectedElement.y}
                  onChange={(e) => updateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-[12px] mt-1 border-[#e2e8f0] bg-[#f8f9fb]"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <Label className="text-[11px] text-[#64748b]">Couleur</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedElement.color}
                  onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                  className="w-7 h-7 rounded-md border border-[#e2e8f0] cursor-pointer p-0.5"
                />
                <Input
                  value={selectedElement.color}
                  onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                  className="h-7 text-[12px] flex-1 border-[#e2e8f0] bg-[#f8f9fb] font-mono"
                />
              </div>
            </div>

            <Separator className="bg-[#e5e7eb]" />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="h-7 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#475569] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors"
                onClick={() => updateElement(selectedElement.id, { rotation: (selectedElement.rotation + 90) % 360 })}
              >
                <RotateCw className="h-3 w-3" />
                Pivoter
              </button>
              <button
                className="h-7 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#475569] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors"
                onClick={() => duplicateElement(selectedElement.id)}
              >
                <Copy className="h-3 w-3" />
                Dupliquer
              </button>
              <button
                className="h-7 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#475569] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors"
                onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
              >
                {selectedElement.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                Verrouiller
              </button>
              <button
                className="h-7 flex items-center justify-center gap-1.5 text-[11px] font-medium text-white bg-[#ef4444] rounded-lg hover:bg-[#dc2626] transition-colors"
                onClick={() => removeElement(selectedElement.id)}
              >
                <Trash2 className="h-3 w-3" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 flex-1 flex items-center justify-center">
          <p className="text-[12px] text-[#94a3b8] text-center leading-relaxed">
            Sélectionnez un élément ou cliquez
            <br />
            sur Texte pour ajouter une
            <br />
            <span className="text-[#3b82f6] underline underline-offset-2 cursor-pointer">annotation</span>
          </p>
        </div>
      )}
    </div>
  );
}

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    bars_comptoirs: "Bar & Comptoirs",
    assises: "Assises",
    tables: "Tables",
    ecrans_supports: "Écrans & Supports",
    decoration: "Décoration",
    texte: "Texte",
  };
  return map[cat] ?? cat;
}
