"use client";

import { DoubleSide } from "three";
import { RoundedBox } from "@react-three/drei";
import { StandElement } from "@/lib/types";
import { tone } from "./model-utils";
import { AssetPlane } from "./AssetPlane";

interface MiniBarLogoCrownProps {
  color: string;
  depth: number;
  element: StandElement;
  height: number;
  width: number;
}

export function MiniBarLogoCrown({
  color,
  depth,
  element,
  height,
  width,
}: MiniBarLogoCrownProps) {
  const counterHeight = Math.min(1.08, Math.max(0.94, height * 0.34));
  const counterTopThickness = 0.08;
  const counterBodyHeight = Math.max(counterHeight - counterTopThickness, 0.78);
  const wallThickness = Math.min(0.08, Math.max(width, depth) * 0.08);
  const innerWidth = Math.max(width - wallThickness * 2 - 0.12, 0.74);
  const innerDepth = Math.max(depth - wallThickness * 1.6 - 0.14, 0.62);
  const frontZ = depth / 2 - wallThickness / 2;
  const sideX = width / 2 - wallThickness / 2;
  const backDoorWidth = Math.min(0.68, Math.max(width * 0.22, 0.46));
  const backSideWidth = Math.max((width - backDoorWidth) / 2 - wallThickness * 0.5, 0.2);
  const backDoorHeight = Math.max(counterBodyHeight * 0.72, 0.64);
  const ringHeight = 0.42;
  const ringThickness = 0.08;
  const ringCenterY = Math.min(Math.max(element.logoFrameHeight ?? height, 2.4), 4.4) - ringHeight / 2;
  const postHeight = Math.max(ringCenterY - ringHeight / 2 - counterHeight, 0.92);
  const postX = Math.max(width / 2 - 0.18, 0.18);
  const postZ = Math.max(depth / 2 - 0.18, 0.18);
  const ringWidth = width + 0.28;
  const ringDepth = depth + 0.28;
  const sideSpan = Math.max(ringDepth - ringThickness * 1.4, depth * 0.82);
  const logoPanelHeight = ringHeight * 0.62;
  const logoPanelWidth = ringWidth * 0.66;
  const sideLogoWidth = sideSpan * 0.5;

  return (
    <>
      <mesh castShadow position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[width * 0.88, 0.04, depth * 0.88]} />
        <meshStandardMaterial color={tone(color, -0.22)} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[innerWidth, 0.03, innerDepth]} />
        <meshStandardMaterial color="#f3eadb" roughness={0.82} />
      </mesh>

      <RoundedBox args={[width, counterTopThickness, depth]} castShadow position={[0, counterHeight - counterTopThickness / 2, 0]} radius={0.05} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.24)} metalness={0.16} roughness={0.34} />
      </RoundedBox>

      <mesh castShadow position={[0, counterBodyHeight / 2, frontZ]} receiveShadow>
        <boxGeometry args={[width, counterBodyHeight, wallThickness]} />
        <meshStandardMaterial color={color} metalness={0.08} roughness={0.52} />
      </mesh>
      <mesh castShadow position={[sideX, counterBodyHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, counterBodyHeight, depth - wallThickness * 0.24]} />
        <meshStandardMaterial color={tone(color, -0.04)} metalness={0.08} roughness={0.56} />
      </mesh>
      <mesh castShadow position={[-sideX, counterBodyHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, counterBodyHeight, depth - wallThickness * 0.24]} />
        <meshStandardMaterial color={tone(color, -0.04)} metalness={0.08} roughness={0.56} />
      </mesh>

      <mesh castShadow position={[-width / 2 + backSideWidth / 2, counterBodyHeight / 2, -frontZ]} receiveShadow>
        <boxGeometry args={[backSideWidth, counterBodyHeight, wallThickness]} />
        <meshStandardMaterial color={tone(color, -0.02)} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[width / 2 - backSideWidth / 2, counterBodyHeight / 2, -frontZ]} receiveShadow>
        <boxGeometry args={[backSideWidth, counterBodyHeight, wallThickness]} />
        <meshStandardMaterial color={tone(color, -0.02)} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[-backDoorWidth * 0.18, backDoorHeight / 2, -frontZ - 0.012]} receiveShadow rotation={[0, Math.PI / 10, 0]}>
        <boxGeometry args={[backDoorWidth * 0.66, backDoorHeight, 0.035]} />
        <meshStandardMaterial color={tone(color, 0.1)} metalness={0.1} roughness={0.48} />
      </mesh>
      <mesh castShadow position={[backDoorWidth * 0.04, backDoorHeight / 2, -frontZ + 0.006]} receiveShadow>
        <boxGeometry args={[0.016, backDoorHeight * 0.18, 0.012]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.32} roughness={0.24} />
      </mesh>

      <mesh castShadow position={[0, counterBodyHeight * 0.58, frontZ + 0.008]}>
        <planeGeometry args={[width * 0.72, counterBodyHeight * 0.42]} />
        <meshStandardMaterial color={tone(color, -0.16)} emissive={tone(color, -0.22)} emissiveIntensity={0.08} side={DoubleSide} />
      </mesh>

      {[
        [postX, counterHeight + postHeight / 2, postZ],
        [postX, counterHeight + postHeight / 2, -postZ],
        [-postX, counterHeight + postHeight / 2, postZ],
        [-postX, counterHeight + postHeight / 2, -postZ],
      ].map((position, index) => (
        <mesh castShadow key={`post-${index}`} position={position as [number, number, number]} receiveShadow>
          <boxGeometry args={[0.08, postHeight, 0.08]} />
          <meshStandardMaterial color="#7c5b3b" metalness={0.22} roughness={0.44} />
        </mesh>
      ))}

      <RoundedBox args={[ringWidth, ringHeight, ringThickness]} castShadow position={[0, ringCenterY, ringDepth / 2]} radius={0.03} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.08)} metalness={0.12} roughness={0.42} />
      </RoundedBox>
      <RoundedBox args={[ringWidth, ringHeight, ringThickness]} castShadow position={[0, ringCenterY, -ringDepth / 2]} radius={0.03} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.08)} metalness={0.12} roughness={0.42} />
      </RoundedBox>
      <RoundedBox args={[ringThickness, ringHeight, sideSpan]} castShadow position={[ringWidth / 2, ringCenterY, 0]} radius={0.03} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.08)} metalness={0.12} roughness={0.42} />
      </RoundedBox>
      <RoundedBox args={[ringThickness, ringHeight, sideSpan]} castShadow position={[-ringWidth / 2, ringCenterY, 0]} radius={0.03} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.08)} metalness={0.12} roughness={0.42} />
      </RoundedBox>

      <mesh castShadow position={[0, ringCenterY, ringDepth / 2 + ringThickness / 2 + 0.008]} receiveShadow>
        <boxGeometry args={[logoPanelWidth, logoPanelHeight, 0.02]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.34} metalness={0.04} />
      </mesh>
      <group position={[0, ringCenterY, ringDepth / 2 + ringThickness / 2 + 0.02]}>
        <AssetPlane asset={element.logoAsset} height={logoPanelHeight * 0.76} width={logoPanelWidth * 0.88} />
      </group>

      <mesh castShadow position={[0, ringCenterY, -ringDepth / 2 - ringThickness / 2 - 0.008]} receiveShadow>
        <boxGeometry args={[logoPanelWidth, logoPanelHeight, 0.02]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.34} metalness={0.04} />
      </mesh>
      <group position={[0, ringCenterY, -ringDepth / 2 - ringThickness / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <AssetPlane asset={element.logoAsset} height={logoPanelHeight * 0.76} width={logoPanelWidth * 0.88} />
      </group>

      <mesh castShadow position={[ringWidth / 2 + ringThickness / 2 + 0.008, ringCenterY, 0]} receiveShadow>
        <boxGeometry args={[0.02, logoPanelHeight, sideLogoWidth]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.34} metalness={0.04} />
      </mesh>
      <group position={[ringWidth / 2 + ringThickness / 2 + 0.02, ringCenterY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <AssetPlane asset={element.logoAsset} height={logoPanelHeight * 0.74} width={sideLogoWidth * 0.88} />
      </group>

      <mesh castShadow position={[-ringWidth / 2 - ringThickness / 2 - 0.008, ringCenterY, 0]} receiveShadow>
        <boxGeometry args={[0.02, logoPanelHeight, sideLogoWidth]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.34} metalness={0.04} />
      </mesh>
      <group position={[-ringWidth / 2 - ringThickness / 2 - 0.02, ringCenterY, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <AssetPlane asset={element.logoAsset} height={logoPanelHeight * 0.74} width={sideLogoWidth * 0.88} />
      </group>
    </>
  );
}
