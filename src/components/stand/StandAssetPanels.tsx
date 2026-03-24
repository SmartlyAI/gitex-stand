"use client";

import React from "react";
import { STAND_ASSET_ACCEPT } from "@/lib/stand-assets";
import { StandElement, StandFloorSettings } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { AssetUploadField } from "./AssetUploadField";

interface FloorAssetSettingsProps {
  floorSettings: StandFloorSettings;
  updateFloorSettings: (updates: Partial<StandFloorSettings>) => void;
}

interface MiniBarLogoSettingsProps {
  element: StandElement;
  updateElement: (id: string, updates: Partial<StandElement>) => void;
}

export function FloorAssetSettings({
  floorSettings,
  updateFloorSettings,
}: FloorAssetSettingsProps) {
  if (floorSettings.finish !== "parquet") {
    return null;
  }

  return (
    <AssetUploadField
      accept={STAND_ASSET_ACCEPT.parquet_texture}
      asset={floorSettings.textureAsset}
      description="Texture bois personnalisée stockée dans GridFS et réutilisée dans les vues 2D et 3D."
      kind="parquet_texture"
      label="Texture parquet"
      onChange={(asset) => updateFloorSettings({ textureAsset: asset })}
    />
  );
}

export function MiniBarLogoSettings({
  element,
  updateElement,
}: MiniBarLogoSettingsProps) {
  if (element.catalogId !== "mini_bar_couronne_logo") {
    return null;
  }

  const crownHeight = element.logoFrameHeight ?? 3.2;

  return (
    <div className="space-y-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
          Mini-bar
        </h4>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-[11px] text-[#64748b]">Couleur LED</Label>
          <span className="text-[10px] font-semibold text-[#1e293b] uppercase">
            {element.ledColor ?? "#a855f7"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.ledColor ?? "#a855f7"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateElement(element.id, { ledColor: e.target.value })}
            className="h-7 w-7 rounded-md border border-[#e2e8f0] p-0.5"
          />
          <Input
            value={element.ledColor ?? "#a855f7"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateElement(element.id, { ledColor: e.target.value })}
            className="h-7 flex-1 border-[#e2e8f0] bg-white font-mono text-[12px]"
          />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label className="text-[11px] text-[#64748b]">Hauteur de la couronne</Label>
          <span className="text-[10px] font-semibold text-[#1e293b]">
            {crownHeight.toFixed(2)}m
          </span>
        </div>
        <Slider
          max={4.4}
          min={2.4}
          onValueChange={(value: number) =>
            updateElement(element.id, { logoFrameHeight: value })
          }
          step={0.05}
          value={crownHeight}
        />
      </div>

      <AssetUploadField
        accept={STAND_ASSET_ACCEPT.logo}
        asset={element.logoAsset}
        description="Le logo est appliqué sur les quatre faces de la couronne dans la vue 3D."
        kind="logo"
        label="Logo de la couronne"
        onChange={(asset) => updateElement(element.id, { logoAsset: asset })}
      />
    </div>
  );
}
