"use client";

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
  ledColor?: string;
}

export function MiniBarLogoCrown({
  color,
  depth,
  element,
  height,
  width,
  ledColor = "#a855f7",
}: MiniBarLogoCrownProps) {
  const counterHeight = Math.min(1.08, Math.max(0.94, height * 0.34));
  const counterTopThickness = 0.08;
  const counterBodyHeight = Math.max(counterHeight - counterTopThickness, 0.78);
  const wallThickness = Math.min(0.24, Math.max(width, depth) * 0.15);
  const innerWidth = Math.max(width - wallThickness * 2, 0.6);
  const innerDepth = Math.max(depth - wallThickness, 0.6);
  const frontZ = depth / 2 - wallThickness / 2;
  const sideX = width / 2 - wallThickness / 2;
  const sideZ = -wallThickness / 2;
  const sideDepth = depth - wallThickness;
  const ringHeight = 0.42;
  const ringThickness = 0.08;
  const ringCenterY = Math.min(Math.max(element.logoFrameHeight ?? height, 2.4), 4.4) - ringHeight / 2;
  const postHeight = Math.max(ringCenterY - ringHeight / 2 - counterHeight, 0.92);
  const postX = Math.max(width / 2 - wallThickness / 2, 0.18);
  const postZ = Math.max(depth / 2 - wallThickness / 2, 0.18);
  const backPostZ = Math.max(-depth / 2 + wallThickness / 2, -depth / 2 + 0.18);
  const ringWidth = width + 0.28;
  const ringDepth = depth + 0.28;
  const sideSpan = Math.max(ringDepth - ringThickness * 1.4, depth * 0.82);
  const logoPanelHeight = ringHeight * 0.62;
  const logoPanelWidth = ringWidth * 0.66;
  const sideLogoWidth = sideSpan * 0.5;
  const slatCount = Math.max(Math.round((width + sideDepth * 2) / 0.11), 16);
  const backPanelWidth = (width - 0.5) / 2; // Largeur des panneaux arrière pour laisser un passage de 0.5m
  const serviceShelfWidth = Math.max(Math.min(innerWidth * 0.8, 1.2), 0.6);
  const serviceShelfDepth = Math.max(Math.min(innerDepth * 0.4, 0.35), 0.2);
  const serviceShelfHeight = Math.max(counterHeight * 0.7, 0.76);
  const serviceShelfZ = depth / 2 - wallThickness - serviceShelfDepth / 2;
  const coffeeMachineWidth = Math.min(serviceShelfWidth * 0.34, 0.24);
  const coffeeMachineDepth = Math.min(serviceShelfDepth * 0.76, 0.16);
  const coffeeMachineHeight = 0.28;
  const coffeeMachineY = serviceShelfHeight + coffeeMachineHeight / 2 + 0.018;
  const coffeeMachineZ = serviceShelfZ + 0.02;

  return (
    <>
      <mesh castShadow position={[0, 0.02, frontZ]} receiveShadow>
        <boxGeometry args={[width, 0.04, wallThickness]} />
        <meshStandardMaterial color={tone(color, -0.15)} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[sideX, 0.02, sideZ]} receiveShadow>
        <boxGeometry args={[wallThickness, 0.04, sideDepth]} />
        <meshStandardMaterial color={tone(color, -0.15)} roughness={0.86} />
      </mesh>
      <mesh castShadow position={[-sideX, 0.02, sideZ]} receiveShadow>
        <boxGeometry args={[wallThickness, 0.04, sideDepth]} />
        <meshStandardMaterial color={tone(color, -0.15)} roughness={0.86} />
      </mesh>

      {/* Plateau supérieur en U (avec partie arrière complète et passage démontable) */}
      <RoundedBox args={[width, counterTopThickness, wallThickness]} castShadow position={[0, counterHeight - counterTopThickness / 2, frontZ]} radius={0.02} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.24)} metalness={0.16} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[wallThickness, counterTopThickness, sideDepth - 0.04]} castShadow position={[sideX, counterHeight - counterTopThickness / 2, sideZ - 0.02]} radius={0.02} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.24)} metalness={0.16} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[wallThickness, counterTopThickness, sideDepth - 0.04]} castShadow position={[-sideX, counterHeight - counterTopThickness / 2, sideZ - 0.02]} radius={0.02} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.24)} metalness={0.16} roughness={0.34} />
      </RoundedBox>
      {/* Panneaux fixes arrière du plateau */}
      <RoundedBox args={[backPanelWidth, counterTopThickness, wallThickness]} castShadow position={[width / 2 - backPanelWidth / 2, counterHeight - counterTopThickness / 2, -depth / 2 + wallThickness / 2]} radius={0.02} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.24)} metalness={0.16} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[backPanelWidth, counterTopThickness, wallThickness]} castShadow position={[-width / 2 + backPanelWidth / 2, counterHeight - counterTopThickness / 2, -depth / 2 + wallThickness / 2]} radius={0.02} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.24)} metalness={0.16} roughness={0.34} />
      </RoundedBox>
      {/* Partie démontable centrale (surbaissée très légèrement pour la démarquer) */}
      <RoundedBox args={[0.5, counterTopThickness * 0.9, wallThickness]} castShadow position={[0, counterHeight - counterTopThickness / 2 - 0.005, -depth / 2 + wallThickness / 2]} radius={0.01} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.18)} metalness={0.16} roughness={0.38} />
      </RoundedBox>

      <mesh castShadow position={[0, counterBodyHeight / 2, frontZ]} receiveShadow>
        <boxGeometry args={[width * 0.96, counterBodyHeight, wallThickness * 0.9]} />
        <meshStandardMaterial color={tone(color, -0.05)} metalness={0.05} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[sideX, counterBodyHeight / 2, sideZ]} receiveShadow>
        <boxGeometry args={[wallThickness * 0.9, counterBodyHeight, sideDepth * 0.96]} />
        <meshStandardMaterial color={tone(color, -0.05)} metalness={0.05} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-sideX, counterBodyHeight / 2, sideZ]} receiveShadow>
        <boxGeometry args={[wallThickness * 0.9, counterBodyHeight, sideDepth * 0.96]} />
        <meshStandardMaterial color={tone(color, -0.05)} metalness={0.05} roughness={0.6} />
      </mesh>

      {/* Façade arrière avec passage au centre */}
      <mesh castShadow position={[-width / 2 + backPanelWidth / 2, counterBodyHeight / 2, -depth / 2 + wallThickness / 2]} receiveShadow>
        <boxGeometry args={[backPanelWidth, counterBodyHeight, wallThickness * 0.9]} />
        <meshStandardMaterial color={tone(color, -0.05)} metalness={0.05} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[width / 2 - backPanelWidth / 2, counterBodyHeight / 2, -depth / 2 + wallThickness / 2]} receiveShadow>
        <boxGeometry args={[backPanelWidth, counterBodyHeight, wallThickness * 0.9]} />
        <meshStandardMaterial color={tone(color, -0.05)} metalness={0.05} roughness={0.6} />
      </mesh>

      {Array.from({ length: slatCount }, (_, i) => {
        const perimeter = width + depth * 2 + backPanelWidth * 2;
        const pos = (i / slatCount) * perimeter;
        const slatWidth = 0.025;
        const slatHeight = counterBodyHeight * 0.9;
        let px = 0, pz = 0;
        const rx = 0, rz = 0;
        let ry = 0;
        
        if (pos < depth) {
          px = -width / 2 - 0.005;
          pz = depth / 2 - pos;
          ry = -Math.PI / 2;
        } else if (pos < depth + width) {
          px = -width / 2 + (pos - depth);
          pz = depth / 2 + 0.005;
        } else if (pos < depth * 2 + width) {
          px = width / 2 + 0.005;
          pz = -depth / 2 + (pos - depth - width);
          ry = Math.PI / 2;
        } else if (pos < depth * 2 + width + backPanelWidth) {
          const relPos = pos - (depth * 2 + width);
          px = width / 2 - relPos;
          pz = -depth / 2 - 0.005;
          ry = Math.PI;
        } else {
          const relPos = pos - (depth * 2 + width + backPanelWidth);
          px = -0.25 - relPos;
          pz = -depth / 2 - 0.005;
          ry = Math.PI;
        }
        
        return (
          <mesh castShadow key={`slat-${i}`} position={[px, slatHeight / 2 + 0.05, pz]} rotation={[rx, ry, rz]} receiveShadow>
            <boxGeometry args={[slatWidth, slatHeight, 0.015]} />
            <meshStandardMaterial color={tone(color, 0.15)} metalness={0.1} roughness={0.4} />
          </mesh>
        );
      })}

      <mesh position={[0, 0.06, depth / 2 + 0.008]}>
        <boxGeometry args={[width * 0.98, 0.03, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[width / 2 + 0.008, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth * 0.98, 0.03, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-width / 2 - 0.008, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth * 0.98, 0.03, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[width / 2 - backPanelWidth / 2, 0.06, -depth / 2 - 0.008]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[backPanelWidth * 0.96, 0.03, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-width / 2 + backPanelWidth / 2, 0.06, -depth / 2 - 0.008]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[backPanelWidth * 0.96, 0.03, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>

      <mesh castShadow position={[0, serviceShelfHeight - 0.015, serviceShelfZ]} receiveShadow>
        <boxGeometry args={[serviceShelfWidth, 0.03, serviceShelfDepth]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.5} />
      </mesh>

      <group position={[-serviceShelfWidth * 0.2, coffeeMachineY, coffeeMachineZ]} rotation={[0, Math.PI, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[coffeeMachineWidth, coffeeMachineHeight, coffeeMachineDepth]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, coffeeMachineHeight * 0.15, coffeeMachineDepth / 2 + 0.005]} receiveShadow>
          <boxGeometry args={[coffeeMachineWidth * 0.7, coffeeMachineHeight * 0.5, 0.01]} />
          <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0, coffeeMachineHeight / 2 + 0.01, -coffeeMachineDepth * 0.1]} receiveShadow>
          <boxGeometry args={[coffeeMachineWidth * 0.8, 0.02, coffeeMachineDepth * 0.7]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[-0.03, -coffeeMachineHeight / 2 + 0.015, coffeeMachineDepth * 0.6]} receiveShadow>
          <cylinderGeometry args={[0.02, 0.018, 0.03, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0.03, -coffeeMachineHeight / 2 + 0.015, coffeeMachineDepth * 0.6]} receiveShadow>
          <cylinderGeometry args={[0.02, 0.018, 0.03, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      </group>

      {[
        [postX, counterHeight + postHeight / 2, postZ],
        [postX, counterHeight + postHeight / 2, backPostZ],
        [-postX, counterHeight + postHeight / 2, postZ],
        [-postX, counterHeight + postHeight / 2, backPostZ],
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
