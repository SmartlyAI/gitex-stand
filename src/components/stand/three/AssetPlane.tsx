"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { DoubleSide, RepeatWrapping, SRGBColorSpace, Texture } from "three";
import { StandAssetReference } from "@/lib/types";

interface AssetPlaneProps {
  asset: StandAssetReference | null | undefined;
  height: number;
  preserveAspectRatio?: boolean;
  repeatX?: number;
  repeatY?: number;
  tone?: string;
  width: number;
}

function configureTexture(texture: Texture, repeatX: number, repeatY: number) {
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.needsUpdate = true;
}

export function AssetPlane({
  asset,
  height,
  preserveAspectRatio = true,
  repeatX = 1,
  repeatY = 1,
  tone = "#ffffff",
  width,
}: AssetPlaneProps) {
  const texture = useTexture(asset?.url ?? "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=");

  const fittedSize = useMemo(() => {
    const image = texture.image as
      | {
          width?: number;
          height?: number;
          videoWidth?: number;
          videoHeight?: number;
        }
      | undefined;

    const sourceWidth = image?.width ?? image?.videoWidth ?? 1;
    const sourceHeight = image?.height ?? image?.videoHeight ?? 1;

    if (!preserveAspectRatio || !asset || sourceWidth <= 0 || sourceHeight <= 0) {
      return { height, width };
    }

    const sourceRatio = sourceWidth / sourceHeight;
    const boxRatio = width / height;

    if (sourceRatio > boxRatio) {
      return {
        height: width / sourceRatio,
        width,
      };
    }

    return {
      height,
      width: height * sourceRatio,
    };
  }, [asset, height, preserveAspectRatio, texture.image, width]);

  useEffect(() => {
    configureTexture(texture, repeatX, repeatY);
  }, [repeatX, repeatY, texture]);

  return (
    <mesh>
      <planeGeometry args={[fittedSize.width, fittedSize.height]} />
      <meshBasicMaterial
        color={tone}
        map={asset ? texture : null}
        opacity={asset ? 1 : 0.16}
        side={DoubleSide}
        transparent
      />
    </mesh>
  );
}
