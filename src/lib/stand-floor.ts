import type { CSSProperties } from "react";
import { StandFloorFinish, StandFloorSettings } from "./types";
import { normalizeStandFloorAssetSettings } from "./stand-assets";

export const DEFAULT_STAND_FLOOR_SETTINGS: StandFloorSettings = {
  finish: "sol_uni",
  color: "#f8fafc",
  elevation: 0,
  textureAsset: null,
};

export const STAND_FLOOR_FINISHES: Array<{
  accentLabel: string;
  label: string;
  value: StandFloorFinish;
}> = [
  { accentLabel: "Couleur", label: "Sol uni", value: "sol_uni" },
  { accentLabel: "Couleur", label: "Moquette", value: "moquette" },
  { accentLabel: "Teinte bois", label: "Parquet", value: "parquet" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeHex(color: string) {
  const sanitized = color.trim();
  const match = sanitized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (!match) {
    return DEFAULT_STAND_FLOOR_SETTINGS.color;
  }

  const value = match[1];
  if (value.length === 3) {
    return `#${value
      .split("")
      .map((part) => `${part}${part}`)
      .join("")}`;
  }

  return `#${value.toLowerCase()}`;
}

function mixHex(color: string, target: string, ratio: number) {
  const base = normalizeHex(color);
  const mixTarget = normalizeHex(target);
  const amount = clamp(ratio, 0, 1);

  const [r1, g1, b1] = [1, 3, 5].map((offset) =>
    Number.parseInt(base.slice(offset, offset + 2), 16)
  );
  const [r2, g2, b2] = [1, 3, 5].map((offset) =>
    Number.parseInt(mixTarget.slice(offset, offset + 2), 16)
  );

  const mixChannel = (left: number, right: number) =>
    Math.round(left + (right - left) * amount)
      .toString(16)
      .padStart(2, "0");

  return `#${mixChannel(r1, r2)}${mixChannel(g1, g2)}${mixChannel(b1, b2)}`;
}

export function normalizeStandFloorSettings(
  settings?: Partial<StandFloorSettings> | null
): StandFloorSettings {
  return normalizeStandFloorAssetSettings({
    finish: settings?.finish ?? DEFAULT_STAND_FLOOR_SETTINGS.finish,
    color: normalizeHex(settings?.color ?? DEFAULT_STAND_FLOOR_SETTINGS.color),
    elevation: clamp(
      settings?.elevation ?? DEFAULT_STAND_FLOOR_SETTINGS.elevation,
      0,
      0.3
    ),
    textureAsset: settings?.textureAsset ?? DEFAULT_STAND_FLOOR_SETTINGS.textureAsset,
  });
}

export function getStandFloorFinishLabel(finish: StandFloorFinish) {
  return (
    STAND_FLOOR_FINISHES.find((option) => option.value === finish)?.label ??
    finish
  );
}

export function getStandPlatformMetrics(settings: StandFloorSettings) {
  const normalized = normalizeStandFloorSettings(settings);
  const topY = normalized.elevation;
  const thickness = normalized.elevation > 0 ? normalized.elevation : 0.04;

  return {
    thickness,
    topY,
  };
}

export function getStandFloorPalette(settings: StandFloorSettings) {
  const normalized = normalizeStandFloorSettings(settings);

  switch (normalized.finish) {
    case "moquette":
      return {
        accentColor: mixHex(normalized.color, "#ffffff", 0.08),
        edgeColor: mixHex(normalized.color, "#0f172a", 0.18),
        roughness: 0.96,
        sheenColor: mixHex(normalized.color, "#ffffff", 0.12),
        surfaceColor: mixHex(normalized.color, "#ffffff", 0.04),
        trimColor: mixHex(normalized.color, "#111827", 0.12),
      };
    case "parquet":
      return {
        accentColor: mixHex(normalized.color, "#ffffff", 0.14),
        edgeColor: mixHex(normalized.color, "#111827", 0.24),
        roughness: 0.66,
        sheenColor: mixHex(normalized.color, "#fef3c7", 0.24),
        surfaceColor: mixHex(normalized.color, "#ffffff", 0.06),
        trimColor: mixHex(normalized.color, "#7c2d12", 0.16),
      };
    default:
      return {
        accentColor: mixHex(normalized.color, "#ffffff", 0.08),
        edgeColor: mixHex(normalized.color, "#111827", 0.16),
        roughness: 0.84,
        sheenColor: mixHex(normalized.color, "#ffffff", 0.1),
        surfaceColor: normalized.color,
        trimColor: mixHex(normalized.color, "#0f172a", 0.18),
      };
  }
}

export function getStandFloorCanvasStyle(
  settings: StandFloorSettings
): CSSProperties {
  const normalized = normalizeStandFloorSettings(settings);
  const lift = normalized.elevation * 100;

  if (normalized.finish === "parquet") {
    const base = mixHex(normalized.color, "#ffffff", 0.08);
    const seam = mixHex(normalized.color, "#111827", 0.18);
    const strip = mixHex(normalized.color, "#fef3c7", 0.14);

    if (normalized.textureAsset) {
      return {
        backgroundColor: base,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.16), rgba(17,24,39,0.08)), repeating-linear-gradient(90deg, transparent 0px, transparent 58px, ${seam} 58px, ${seam} 60px), url(${normalized.textureAsset.url})`,
        backgroundPosition: "center, center, center",
        backgroundSize: "cover, 120px 120px, 420px 420px",
        boxShadow:
          lift > 0
            ? `0 ${10 + lift * 0.65}px ${22 + lift * 1.4}px rgba(15, 23, 42, 0.18)`
            : "0 1px 2px rgba(15, 23, 42, 0.04)",
      };
    }

    return {
      backgroundColor: base,
      backgroundImage: `repeating-linear-gradient(90deg, ${strip} 0px, ${strip} 28px, ${seam} 28px, ${seam} 30px, ${base} 30px, ${base} 62px), repeating-linear-gradient(0deg, transparent 0px, transparent 94px, ${seam} 94px, ${seam} 96px)`,
      boxShadow:
        lift > 0
          ? `0 ${10 + lift * 0.65}px ${22 + lift * 1.4}px rgba(15, 23, 42, 0.18)`
          : "0 1px 2px rgba(15, 23, 42, 0.04)",
    };
  }

  if (normalized.finish === "moquette") {
    const base = mixHex(normalized.color, "#ffffff", 0.05);
    const fiber = mixHex(normalized.color, "#111827", 0.08);

    return {
      backgroundColor: base,
      backgroundImage: `radial-gradient(circle at 20% 20%, ${mixHex(base, "#ffffff", 0.12)} 0, ${mixHex(base, "#ffffff", 0.12)} 1px, transparent 1px), radial-gradient(circle at 70% 35%, ${fiber} 0, ${fiber} 1px, transparent 1px), radial-gradient(circle at 40% 70%, ${mixHex(base, "#000000", 0.04)} 0, ${mixHex(base, "#000000", 0.04)} 1px, transparent 1px)`,
      backgroundSize: "18px 18px, 22px 22px, 26px 26px",
      boxShadow:
        lift > 0
          ? `0 ${10 + lift * 0.65}px ${22 + lift * 1.4}px rgba(15, 23, 42, 0.18)`
          : "0 1px 2px rgba(15, 23, 42, 0.04)",
    };
  }

  return {
    backgroundColor: normalized.color,
    boxShadow:
      lift > 0
        ? `0 ${10 + lift * 0.65}px ${22 + lift * 1.4}px rgba(15, 23, 42, 0.18)`
        : "0 1px 2px rgba(15, 23, 42, 0.04)",
  };
}
