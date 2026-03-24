"use client";

import React, { useState, useEffect } from "react";
import { useStandStore } from "@/lib/store";
import { STAND_FLOOR_FINISHES } from "@/lib/stand-floor";
import { measureTextContent } from "@/lib/text-measure";
import { TvScreenMode } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { FloorAssetSettings, MiniBarLogoSettings, PartitionTvSettings } from "./StandAssetPanels";
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
    floorSettings,
    updateFloorSettings,
    elements,
    selectedElementId,
    selectedElementIds,
    updateElement,
    removeElement,
    removeSelectedElements,
    duplicateElement,
  } = useStandStore();

  const selectedCount = selectedElementIds.length;
  const selectedElement =
    selectedCount === 1
      ? elements.find((e) => e.id === selectedElementId)
      : undefined;

  const selectedFontSizeValue =
    selectedElement?.category === "texte"
      ? String(selectedElement.fontSize ?? 18)
      : "";
  const selectedFloorFinish =
    STAND_FLOOR_FINISHES.find((option) => option.value === floorSettings.finish) ??
    STAND_FLOOR_FINISHES[0];
  const isPartitionTv = selectedElement?.catalogId === "ecran_pied";
  const selectedTvScreenMode: TvScreenMode =
    selectedElement?.tvScreenMode ?? "single";

  // Tab state: "stand" (Global) or "element" (Local)
  const [activeTab, setActiveTab] = useState<"stand" | "element">("stand");

  // Auto-switch to element tab when an element is selected
  // Ref to track if we've already done the initial switch for this selection to avoid effect loops
  const prevSelectedCountRef = React.useRef(selectedCount);
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (selectedCount > 0 && prevSelectedCountRef.current === 0) {
      timeoutId = setTimeout(() => setActiveTab("element"), 0);
    } else if (selectedCount === 0 && prevSelectedCountRef.current > 0) {
      timeoutId = setTimeout(() => setActiveTab("stand"), 0);
    }
    prevSelectedCountRef.current = selectedCount;
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [selectedCount]);

  const updatePartitionTv = (updates: {
    tvScreenMode?: TvScreenMode;
    tvScreen1Inches?: number;
    tvScreen2Inches?: number;
    tvScreen1CenterY?: number;
    tvScreen2CenterY?: number;
  }) => {
    if (!selectedElement || selectedElement.catalogId !== "ecran_pied") {
      return;
    }

    updateElement(selectedElement.id, updates);
  };

  const updateTextElementLayout = (
    text: string,
    overrides?: {
      fontSize?: number;
      fontBold?: boolean;
      fontItalic?: boolean;
    }
  ) => {
    if (!selectedElement || selectedElement.category !== "texte") {
      return;
    }

    const nextFontSize = overrides?.fontSize ?? selectedElement.fontSize ?? 18;
    const nextFontBold = overrides?.fontBold ?? selectedElement.fontBold ?? false;
    const nextFontItalic = overrides?.fontItalic ?? selectedElement.fontItalic ?? false;
    const nextText = text.trim().length > 0 ? text : "Texte";
    const nextSize = measureTextContent({
      text: nextText,
      fontSize: nextFontSize * 0.8,
      fontBold: nextFontBold,
      fontItalic: nextFontItalic,
    });

    updateElement(selectedElement.id, {
      text: nextText,
      fontSize: nextFontSize,
      fontBold: nextFontBold,
      fontItalic: nextFontItalic,
      width: nextSize.widthPx / 100,
      height: nextSize.heightPx / 100,
    });
  };

  const catalogLabel = selectedElement
    ? getCategoryLabel(selectedElement.category)
    : null;

  return (
    <div className="w-72 border-l border-[#e5e7eb] bg-white flex flex-col h-full overflow-y-auto">
      {/* Tabs */}
      <div className="flex border-b border-[#e5e7eb] shrink-0 sticky top-0 bg-white z-10">
        <button
          className={`flex-1 h-11 text-[11px] font-semibold tracking-wide transition-colors ${
            activeTab === "stand"
              ? "text-[#1e293b] border-b-2 border-[#1e293b] bg-white"
              : "text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8fafc] border-b-2 border-transparent"
          }`}
          onClick={() => setActiveTab("stand")}
        >
          STAND
        </button>
        <button
          className={`flex-1 h-11 text-[11px] font-semibold tracking-wide transition-colors ${
            activeTab === "element"
              ? "text-[#1e293b] border-b-2 border-[#1e293b] bg-white"
              : "text-[#64748b] hover:text-[#1e293b] hover:bg-[#f8fafc] border-b-2 border-transparent"
          }`}
          onClick={() => setActiveTab("element")}
        >
          ÉLÉMENT
        </button>
      </div>

      {/* Stand Content (Global) */}
      {activeTab === "stand" && (
        <div className="flex flex-col">
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

            <div className="mt-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
                Sol du stand
              </h4>

              <div className="mt-3 space-y-3">
                <div>
                  <Label className="text-[11px] text-[#64748b]">Finition</Label>
                  <div className="mt-1 flex gap-2">
                    {STAND_FLOOR_FINISHES.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`h-7 flex-1 rounded-lg px-2 text-[10px] font-medium transition-colors ${
                          floorSettings.finish === option.value
                            ? "bg-[#1e293b] text-white"
                            : "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f1f5f9]"
                        }`}
                        onClick={() => updateFloorSettings({ finish: option.value })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-[#64748b]">{selectedFloorFinish.accentLabel}</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={floorSettings.color}
                      onChange={(e) => updateFloorSettings({ color: e.target.value })}
                      className="h-7 w-7 rounded-md border border-[#e2e8f0] p-0.5"
                    />
                    <Input
                      value={floorSettings.color}
                      onChange={(e) => updateFloorSettings({ color: e.target.value })}
                      className="h-7 flex-1 border-[#e2e8f0] bg-white font-mono text-[12px]"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-[#64748b]">Couleur LED du stand</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={floorSettings.ledColor ?? "#a855f7"}
                      onChange={(e) => updateFloorSettings({ ledColor: e.target.value })}
                      className="h-7 w-7 rounded-md border border-[#e2e8f0] p-0.5"
                    />
                    <Input
                      value={floorSettings.ledColor ?? "#a855f7"}
                      onChange={(e) => updateFloorSettings({ ledColor: e.target.value })}
                      className="h-7 flex-1 border-[#e2e8f0] bg-white font-mono text-[12px]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[11px] text-[#64748b]">Surélévation</Label>
                    <span className="text-[10px] font-semibold text-[#1e293b]">
                      {Math.round(floorSettings.elevation * 100)} cm
                    </span>
                  </div>
                  <Slider
                    value={floorSettings.elevation}
                    min={0}
                    max={0.3}
                    step={0.01}
                    onValueChange={(v: number) => updateFloorSettings({ elevation: v })}
                  />
                </div>

                <FloorAssetSettings
                  floorSettings={floorSettings}
                  updateFloorSettings={updateFloorSettings}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Element Properties */}
      {activeTab === "element" && selectedCount > 1 && (
        <div className="px-4 pt-4 pb-4 flex-1">
          <h3 className="font-semibold text-[13px] text-[#1e293b]">
            {selectedCount} éléments sélectionnés
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-[#64748b]">
            Vous pouvez déplacer ce groupe directement dans la zone de dessin ou
            appuyer sur Suppr pour tout retirer.
          </p>

          <div className="mt-4">
            <button
              className="h-8 w-full rounded-lg bg-[#ef4444] text-[11px] font-medium text-white transition-colors hover:bg-[#dc2626]"
              onClick={removeSelectedElements}
            >
              Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      {activeTab === "element" && selectedCount === 1 && selectedElement ? (
        <div className="px-4 pt-4 pb-4 flex-1">
          <h3 className="font-semibold text-[13px] text-[#1e293b]">{selectedElement.name}</h3>
          {catalogLabel && (
            <p className="text-[11px] text-[#94a3b8] mb-3">
              {catalogLabel}
            </p>
          )}

          <div className="space-y-3">
            {/* Name (hidden for text elements) */}
            {selectedElement.category !== "texte" && (
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
            )}

            {/* Text content */}
            {selectedElement.category === "texte" && (
              <>
                <div>
                  <Label className="text-[11px] text-[#64748b]">Contenu</Label>
                  <Input
                    value={selectedElement.text ?? ""}
                    onChange={(e) => updateTextElementLayout(e.target.value)}
                    className="h-7 text-[12px] mt-1 border-[#e2e8f0] bg-[#f8f9fb]"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-[#64748b]">Taille de police</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={selectedFontSizeValue}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        const parsedValue = Number(nextValue);

                        if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
                          return;
                        }

                        updateTextElementLayout(selectedElement.text ?? "Texte", {
                          fontSize: parsedValue,
                        });
                      }}
                      className="h-7 w-24 text-[12px] border-[#e2e8f0] bg-[#f8f9fb]"
                    />
                    <span className="text-[11px] text-[#64748b]">px</span>
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
                      onClick={() => updateTextElementLayout(selectedElement.text ?? "Texte", { fontBold: !selectedElement.fontBold })}
                    >
                      Gras
                    </button>
                    <button
                      className={`h-6 px-3 text-[10px] italic rounded-md transition-colors ${
                        selectedElement.fontItalic
                          ? "bg-[#1e293b] text-white"
                          : "border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]"
                      }`}
                      onClick={() => updateTextElementLayout(selectedElement.text ?? "Texte", { fontItalic: !selectedElement.fontItalic })}
                    >
                      Italique
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Dimensions */}
            {selectedElement.category !== "texte" && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[11px] text-[#64748b]">Largeur</Label>
                    <span className="text-[10px] font-semibold text-[#1e293b]">{selectedElement.width.toFixed(2)}m</span>
                  </div>
                  <Slider
                    value={selectedElement.width}
                    min={0.01}
                    max={5}
                    step={0.01}
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
                    min={0.01}
                    max={5}
                    step={0.01}
                    onValueChange={(v: number) => updateElement(selectedElement.id, { height: v })}
                  />
                </div>
              </div>
            )}

            {isPartitionTv && (
              <div className="space-y-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <div>
                  <Label className="text-[11px] text-[#64748b]">Écrans</Label>
                  <div className="mt-1 flex gap-2">
                    {([
                      { label: "1 côté", value: "single" },
                      { label: "2 côtés", value: "double" },
                    ] as Array<{ label: string; value: TvScreenMode }>).map((option) => (
                      <button
                        key={option.value}
                        className={`h-7 flex-1 rounded-lg text-[11px] font-medium transition-colors ${
                          selectedTvScreenMode === option.value
                            ? "bg-[#1e293b] text-white"
                            : "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f1f5f9]"
                        }`}
                        onClick={() =>
                          updatePartitionTv({
                            tvScreenMode: option.value,
                            tvScreen2Inches:
                              option.value === "double"
                                ? selectedElement.tvScreen2Inches ?? selectedElement.tvScreen1Inches ?? 55
                                : selectedElement.tvScreen2Inches,
                          })
                        }
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-[#64748b]">
                    {selectedTvScreenMode === "single" ? "Dimension écran" : "Dimension écran 1"}
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="number"
                      min={24}
                      max={120}
                      step={1}
                      value={String(selectedElement.tvScreen1Inches ?? 55)}
                      onChange={(e) => {
                        const parsedValue = Number(e.target.value);

                        if (!Number.isFinite(parsedValue) || parsedValue < 24 || parsedValue > 120) {
                          return;
                        }

                        updatePartitionTv({ tvScreen1Inches: parsedValue });
                      }}
                      className="h-7 w-24 text-[12px] border-[#e2e8f0] bg-white"
                    />
                    <span className="text-[11px] text-[#64748b]">pouces</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[11px] text-[#64748b]">
                      {selectedTvScreenMode === "single" ? "Hauteur écran" : "Hauteur écran 1"}
                    </Label>
                    <span className="text-[10px] font-semibold text-[#1e293b]">
                      {(selectedElement.tvScreen1CenterY ?? 1.45).toFixed(2)}m
                    </span>
                  </div>
                  <Slider
                    value={selectedElement.tvScreen1CenterY ?? 1.45}
                    min={0.4}
                    max={3.2}
                    step={0.05}
                    onValueChange={(v: number) => updatePartitionTv({ tvScreen1CenterY: v })}
                  />
                </div>

                {selectedTvScreenMode === "double" && (
                  <>
                    <div>
                      <Label className="text-[11px] text-[#64748b]">Dimension écran 2</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input
                          type="number"
                          min={24}
                          max={120}
                          step={1}
                          value={String(selectedElement.tvScreen2Inches ?? selectedElement.tvScreen1Inches ?? 55)}
                          onChange={(e) => {
                            const parsedValue = Number(e.target.value);

                            if (!Number.isFinite(parsedValue) || parsedValue < 24 || parsedValue > 120) {
                              return;
                            }

                            updatePartitionTv({ tvScreen2Inches: parsedValue });
                          }}
                          className="h-7 w-24 text-[12px] border-[#e2e8f0] bg-white"
                        />
                        <span className="text-[11px] text-[#64748b]">pouces</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[11px] text-[#64748b]">Hauteur écran 2</Label>
                        <span className="text-[10px] font-semibold text-[#1e293b]">
                          {(selectedElement.tvScreen2CenterY ?? selectedElement.tvScreen1CenterY ?? 1.45).toFixed(2)}m
                        </span>
                      </div>
                      <Slider
                        value={selectedElement.tvScreen2CenterY ?? selectedElement.tvScreen1CenterY ?? 1.45}
                        min={0.4}
                        max={3.2}
                        step={0.05}
                        onValueChange={(v: number) => updatePartitionTv({ tvScreen2CenterY: v })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <MiniBarLogoSettings
              element={selectedElement}
              updateElement={updateElement}
            />

            <PartitionTvSettings
              element={selectedElement}
              updateElement={updateElement}
            />

            {/* Rangement Table de Démo */}
            {selectedElement.catalogId === "table_demo" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-[11px] text-[#64748b]">Rangement</Label>
                </div>
                <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-0.5">
                  <button
                    className={`h-7 flex-1 rounded-md text-[11px] font-medium transition-colors ${
                      (!selectedElement.storageOrientation || selectedElement.storageOrientation === "right")
                        ? "bg-white text-[#1e293b] shadow-sm"
                        : "text-[#64748b] hover:text-[#1e293b]"
                    }`}
                    onClick={() => updateElement(selectedElement.id, { storageOrientation: "right" })}
                  >
                    À droite
                  </button>
                  <button
                    className={`h-7 flex-1 rounded-md text-[11px] font-medium transition-colors ${
                      selectedElement.storageOrientation === "left"
                        ? "bg-white text-[#1e293b] shadow-sm"
                        : "text-[#64748b] hover:text-[#1e293b]"
                    }`}
                    onClick={() => updateElement(selectedElement.id, { storageOrientation: "left" })}
                  >
                    À gauche
                  </button>
                </div>
              </div>
            )}

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
      ) : null}

      {activeTab === "element" && selectedCount === 0 && (
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
