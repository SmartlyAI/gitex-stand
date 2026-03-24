import { StandAssetKind, StandAssetReference, StandElement, StandFloorSettings } from "./types";

export const STAND_ASSET_ACCEPT: Record<StandAssetKind, string> = {
  logo: "image/png,image/jpeg,image/webp,image/svg+xml",
  parquet_texture: "image/png,image/jpeg,image/webp",
  tv_screen: "image/png,image/jpeg,image/webp",
  tv_sticker: "image/png,image/jpeg,image/webp,image/svg+xml",
};

export const STAND_ASSET_MAX_SIZE_BYTES = 8 * 1024 * 1024;

export const TRANSPARENT_IMAGE_DATA_URL =
  "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function buildStandAssetUrl(assetId: string) {
  return `/api/assets/${assetId}`;
}

export function isStandAssetKind(value: string): value is StandAssetKind {
  return value === "logo" || value === "parquet_texture" || value === "tv_screen" || value === "tv_sticker";
}

export function isSupportedStandAssetContentType(
  kind: StandAssetKind,
  contentType: string
) {
  return STAND_ASSET_ACCEPT[kind]
    .split(",")
    .includes(contentType.toLowerCase());
}

export function normalizeAssetReference(
  value: unknown,
  expectedKind?: StandAssetKind
): StandAssetReference | null {
  if (!isRecord(value)) {
    return null;
  }

  const assetId = typeof value.assetId === "string" ? value.assetId.trim() : "";
  const contentType =
    typeof value.contentType === "string" ? value.contentType.trim().toLowerCase() : "";
  const filename = typeof value.filename === "string" ? value.filename.trim() : "";
  const kind = typeof value.kind === "string" && isStandAssetKind(value.kind) ? value.kind : null;

  if (!assetId || !contentType || !filename || !kind) {
    return null;
  }

  if (expectedKind && kind !== expectedKind) {
    return null;
  }

  return {
    assetId,
    contentType,
    filename,
    kind,
    url: buildStandAssetUrl(assetId),
  };
}

export function normalizeStandElementAssets(element: StandElement): StandElement {
  return {
    ...element,
    logoFrameHeight:
      typeof element.logoFrameHeight === "number" && Number.isFinite(element.logoFrameHeight)
        ? element.logoFrameHeight
        : undefined,
    logoAsset: normalizeAssetReference(element.logoAsset, "logo"),
    tvScreen1Asset: normalizeAssetReference(element.tvScreen1Asset, "tv_screen"),
    tvScreen2Asset: normalizeAssetReference(element.tvScreen2Asset, "tv_screen"),
    tvBaseStickerAsset: normalizeAssetReference(element.tvBaseStickerAsset, "tv_sticker"),
  };
}

export function normalizeStandElements(elements: StandElement[] | undefined | null) {
  return (elements ?? []).map((element) => normalizeStandElementAssets(element));
}

export function normalizeStandFloorAssetSettings(
  settings: StandFloorSettings
): StandFloorSettings {
  return {
    ...settings,
    textureAsset: normalizeAssetReference(settings.textureAsset, "parquet_texture"),
  };
}
