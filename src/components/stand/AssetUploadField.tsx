"use client";

import React, { useRef, useState } from "react";
import { uploadStandAsset } from "@/lib/asset-client";
import { StandAssetKind, StandAssetReference } from "@/lib/types";

interface AssetUploadFieldProps {
  accept: string;
  asset: StandAssetReference | null | undefined;
  description?: string;
  kind: StandAssetKind;
  label: string;
  onChange: (asset: StandAssetReference | null) => void;
}

export function AssetUploadField({
  accept,
  asset,
  description,
  kind,
  label,
  onChange,
}: AssetUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedAsset = await uploadStandAsset(file, kind);
      onChange(uploadedAsset);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Impossible de téléverser le fichier"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const isImageAsset = asset?.contentType.startsWith("image/") ?? false;

  return (
    <div className="space-y-2 rounded-xl border border-[#e2e8f0] bg-white p-3">
      <div>
        <div className="text-[11px] font-medium text-[#475569]">{label}</div>
        {description ? (
          <p className="mt-1 text-[10px] leading-relaxed text-[#94a3b8]">{description}</p>
        ) : null}
      </div>

      {asset ? (
        <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2">
          {isImageAsset ? (
            <div
              className="h-20 w-full rounded-md border border-[#e2e8f0] bg-center bg-contain bg-no-repeat"
              style={{ backgroundImage: `url(${asset.url})` }}
            />
          ) : null}
          <div className="mt-2 truncate text-[11px] font-medium text-[#334155]">
            {asset.filename}
          </div>
          <div className="text-[10px] text-[#94a3b8]">{asset.contentType}</div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          className="h-7 flex-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 text-[11px] font-medium text-[#475569] transition-colors hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUploading}
          onClick={handlePickFile}
          type="button"
        >
          {isUploading ? "Envoi..." : asset ? "Remplacer" : "Téléverser"}
        </button>
        {asset ? (
          <button
            className="h-7 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 text-[11px] font-medium text-[#b91c1c] transition-colors hover:bg-[#fee2e2]"
            onClick={() => onChange(null)}
            type="button"
          >
            Retirer
          </button>
        ) : null}
      </div>

      {error ? <p className="text-[10px] text-[#dc2626]">{error}</p> : null}

      <input
        ref={inputRef}
        accept={accept}
        className="hidden"
        onChange={handleChange}
        type="file"
      />
    </div>
  );
}
