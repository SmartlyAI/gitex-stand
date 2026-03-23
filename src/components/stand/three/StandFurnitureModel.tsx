"use client";

import { memo } from "react";
import { Edges, RoundedBox } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";
import { StandElement } from "@/lib/types";
import { getElementFootprint, getElementHeight, tone } from "./model-utils";

interface StandFurnitureModelProps {
  element: StandElement;
  selected: boolean;
  onSelect: (event: ThreeEvent<MouseEvent>, elementId: string) => void;
}

function SelectionBox({ depth, height, visible, width }: { depth: number; height: number; visible: boolean; width: number }) {
  if (!visible) {
    return null;
  }

  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width + 0.08, height + 0.08, depth + 0.08]} />
      <meshBasicMaterial opacity={0} transparent />
      <Edges color="#2563eb" scale={1.001} threshold={10} />
    </mesh>
  );
}

function TableLegs({ depth, height, inset = 0.08, width }: { depth: number; height: number; inset?: number; width: number }) {
  const legHeight = Math.max(height - 0.08, 0.18);
  const x = Math.max(width / 2 - inset, 0.02);
  const z = Math.max(depth / 2 - inset, 0.02);

  return (
    <>
      {[
        [x, legHeight / 2, z],
        [x, legHeight / 2, -z],
        [-x, legHeight / 2, z],
        [-x, legHeight / 2, -z],
      ].map((position, index) => (
        <mesh castShadow key={index} position={position as [number, number, number]} receiveShadow>
          <boxGeometry args={[0.05, legHeight, 0.05]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.35} roughness={0.5} />
        </mesh>
      ))}
    </>
  );
}

function Stool({ color, depth, height, width }: { color: string; depth: number; height: number; width: number }) {
  const radius = Math.min(width, depth) * 0.42;

  return (
    <>
      <mesh castShadow position={[0, height - 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.92, 0.08, 24]} />
        <meshStandardMaterial color={tone(color, 0.08)} roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, height / 2 - 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.045, 0.055, height - 0.12, 16]} />
        <meshStandardMaterial color="#4b5563" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.16, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.62, 0.02, 10, 32]} />
        <meshStandardMaterial color="#6b7280" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[radius * 0.58, radius * 0.72, 0.04, 24]} />
        <meshStandardMaterial color="#374151" metalness={0.32} roughness={0.42} />
      </mesh>
    </>
  );
}

function Plant({ color, height }: { color: string; height: number }) {
  return (
    <>
      <mesh castShadow position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.28, 24]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.34, 28, 28]} />
        <meshStandardMaterial color={tone(color, -0.06)} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.22, Math.min(height - 0.2, 0.98), 0.06]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={tone(color, 0.12)} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.2, Math.min(height - 0.22, 0.96), -0.08]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color={tone(color, 0.02)} roughness={0.82} />
      </mesh>
    </>
  );
}

function TextSign({ color, depth, element, height, width }: { color: string; depth: number; element: StandElement; height: number; width: number }) {
  const panelHeight = Math.min(height, 1.3);

  return (
    <>
      <mesh castShadow position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.06, 24]} />
        <meshStandardMaterial color="#1f2937" metalness={0.22} roughness={0.46} />
      </mesh>
      <mesh castShadow position={[0, panelHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.05, panelHeight, 0.05]} />
        <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.42} />
      </mesh>
      <RoundedBox args={[width, Math.max(panelHeight * 0.42, 0.48), depth]} castShadow position={[0, panelHeight * 0.74, 0]} radius={0.03} receiveShadow smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.08} roughness={0.46} />
      </RoundedBox>
      <mesh position={[0, panelHeight * 0.74, depth / 2 + 0.002]}>
        <planeGeometry args={[width * 0.88, Math.max(panelHeight * 0.24, 0.2)]} />
        <meshStandardMaterial color={tone(element.color, 0.44)} emissive={tone(element.color, 0.18)} emissiveIntensity={0.12} side={DoubleSide} />
      </mesh>
    </>
  );
}

function FurnitureBody({ color, depth, element, height, width }: { color: string; depth: number; element: StandElement; height: number; width: number }) {
  switch (element.catalogId) {
    case "bar_central":
    case "comptoir_accueil":
      return (
        <>
          <RoundedBox args={[width, height - 0.08, depth]} castShadow position={[0, (height - 0.08) / 2, 0]} radius={0.05} receiveShadow smoothness={4}>
            <meshStandardMaterial color={color} metalness={0.08} roughness={0.5} />
          </RoundedBox>
          <mesh castShadow position={[0, height - 0.04, 0]} receiveShadow>
            <boxGeometry args={[width * 1.02, 0.08, depth * 1.02]} />
            <meshStandardMaterial color={tone(color, 0.22)} metalness={0.18} roughness={0.36} />
          </mesh>
          <mesh castShadow position={[0, height * 0.54, depth / 2 + 0.01]}>
            <planeGeometry args={[width * 0.76, height * 0.42]} />
            <meshStandardMaterial color={tone(color, -0.16)} emissive={tone(color, -0.24)} emissiveIntensity={0.08} side={DoubleSide} />
          </mesh>
        </>
      );
    case "canape":
      return (
        <>
          <RoundedBox args={[width, 0.28, depth * 0.72]} castShadow position={[0, 0.24, 0.02]} radius={0.06} receiveShadow smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.72} />
          </RoundedBox>
          <RoundedBox args={[width, 0.54, 0.16]} castShadow position={[0, 0.52, -depth * 0.28]} radius={0.05} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, -0.06)} roughness={0.75} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.46, depth * 0.66]} castShadow position={[width / 2 - 0.06, 0.39, 0.01]} radius={0.04} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, -0.1)} roughness={0.78} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.46, depth * 0.66]} castShadow position={[-width / 2 + 0.06, 0.39, 0.01]} radius={0.04} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, -0.1)} roughness={0.78} />
          </RoundedBox>
        </>
      );
    case "fauteuil":
      return (
        <>
          <RoundedBox args={[width * 0.9, 0.24, depth * 0.82]} castShadow position={[0, 0.22, 0.02]} radius={0.05} receiveShadow smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.72} />
          </RoundedBox>
          <RoundedBox args={[width * 0.88, 0.5, 0.14]} castShadow position={[0, 0.48, -depth * 0.3]} radius={0.05} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, -0.08)} roughness={0.76} />
          </RoundedBox>
          <RoundedBox args={[0.11, 0.34, depth * 0.74]} castShadow position={[width / 2 - 0.06, 0.33, 0.01]} radius={0.04} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, -0.12)} roughness={0.78} />
          </RoundedBox>
          <RoundedBox args={[0.11, 0.34, depth * 0.74]} castShadow position={[-width / 2 + 0.06, 0.33, 0.01]} radius={0.04} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, -0.12)} roughness={0.78} />
          </RoundedBox>
        </>
      );
    case "tabouret_haut":
      return <Stool color={color} depth={depth} height={height} width={width} />;
    case "pouf":
      return (
        <mesh castShadow position={[0, height / 2, 0]} receiveShadow>
          <cylinderGeometry args={[Math.min(width, depth) * 0.48, Math.min(width, depth) * 0.5, height, 28]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      );
    case "table_demo":
      return (
        <>
          <RoundedBox args={[width, 0.08, depth]} castShadow position={[0, height - 0.04, 0]} radius={0.04} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, 0.18)} metalness={0.12} roughness={0.42} />
          </RoundedBox>
          <TableLegs depth={depth} height={height} width={width} />
        </>
      );
    case "table_haute":
      return (
        <>
          <mesh castShadow position={[0, height - 0.03, 0]} receiveShadow>
            <cylinderGeometry args={[Math.min(width, depth) * 0.48, Math.min(width, depth) * 0.48, 0.06, 28]} />
            <meshStandardMaterial color={tone(color, 0.22)} roughness={0.38} metalness={0.12} />
          </mesh>
          <mesh castShadow position={[0, height / 2 - 0.06, 0]} receiveShadow>
            <cylinderGeometry args={[0.06, 0.06, height - 0.12, 20]} />
            <meshStandardMaterial color="#4b5563" roughness={0.42} metalness={0.3} />
          </mesh>
          <mesh castShadow position={[0, 0.03, 0]} receiveShadow>
            <cylinderGeometry args={[Math.min(width, depth) * 0.28, Math.min(width, depth) * 0.34, 0.05, 24]} />
            <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.32} />
          </mesh>
        </>
      );
    case "table_basse":
      return (
        <>
          <RoundedBox args={[width, 0.07, depth]} castShadow position={[0, height - 0.035, 0]} radius={0.04} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, 0.14)} roughness={0.44} />
          </RoundedBox>
          <TableLegs depth={depth} height={height} inset={0.12} width={width} />
        </>
      );
    case "ecran_pied":
      return (
        <>
          <mesh castShadow position={[0, 0.04, 0]} receiveShadow>
            <cylinderGeometry args={[0.2, 0.24, 0.04, 24]} />
            <meshStandardMaterial color="#111827" metalness={0.28} roughness={0.42} />
          </mesh>
          <mesh castShadow position={[0, 0.8, 0]} receiveShadow>
            <cylinderGeometry args={[0.04, 0.045, 1.5, 20]} />
            <meshStandardMaterial color="#4b5563" metalness={0.32} roughness={0.36} />
          </mesh>
          <RoundedBox args={[width, height * 0.52, 0.08]} castShadow position={[0, height - height * 0.24, 0]} radius={0.03} receiveShadow smoothness={4}>
            <meshStandardMaterial color="#0f172a" metalness={0.16} roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, height - height * 0.24, 0.042]}>
            <planeGeometry args={[width * 0.88, height * 0.42]} />
            <meshStandardMaterial color={tone(color, 0.3)} emissive={tone(color, 0.12)} emissiveIntensity={0.2} side={DoubleSide} />
          </mesh>
        </>
      );
    case "totem":
      return (
        <>
          <RoundedBox args={[width * 0.9, height, depth * 0.9]} castShadow position={[0, height / 2, 0]} radius={0.03} receiveShadow smoothness={4}>
            <meshStandardMaterial color={tone(color, -0.04)} metalness={0.12} roughness={0.42} />
          </RoundedBox>
          <mesh position={[0, height * 0.58, depth * 0.46]}>
            <planeGeometry args={[width * 0.66, height * 0.56]} />
            <meshStandardMaterial color={tone(color, 0.24)} emissive={tone(color, 0.18)} emissiveIntensity={0.22} side={DoubleSide} />
          </mesh>
        </>
      );
    case "mur_image":
      return (
        <>
          <RoundedBox args={[width, height, Math.max(depth, 0.08)]} castShadow position={[0, height / 2, 0]} radius={0.03} receiveShadow smoothness={4}>
            <meshStandardMaterial color="#0f172a" metalness={0.14} roughness={0.34} />
          </RoundedBox>
          <mesh position={[0, height / 2, Math.max(depth, 0.08) / 2 + 0.002]}>
            <planeGeometry args={[width * 0.94, height * 0.84]} />
            <meshStandardMaterial color={tone(color, 0.3)} emissive={tone(color, 0.14)} emissiveIntensity={0.2} side={DoubleSide} />
          </mesh>
        </>
      );
    case "plante":
      return <Plant color={color} height={height} />;
    case "tapis":
      return (
        <RoundedBox args={[width, Math.max(height, 0.025), depth]} castShadow position={[0, Math.max(height, 0.025) / 2, 0]} radius={0.025} receiveShadow smoothness={4}>
          <meshStandardMaterial color={tone(color, 0.04)} roughness={0.94} />
        </RoundedBox>
      );
    default:
      if (element.category === "texte") {
        return <TextSign color={color} depth={depth} element={element} height={height} width={width} />;
      }

      return (
        <RoundedBox args={[width, height, depth]} castShadow position={[0, height / 2, 0]} radius={0.04} receiveShadow smoothness={4}>
          <meshStandardMaterial color={color} metalness={0.08} roughness={0.5} />
        </RoundedBox>
      );
  }
}

export const StandFurnitureModel = memo(function StandFurnitureModel({
  element,
  onSelect,
  selected,
}: StandFurnitureModelProps) {
  const { depth, width } = getElementFootprint(element);
  const height = getElementHeight(element);
  const color = element.category === "texte" ? tone(element.color, 0.08) : element.color;
  const position: [number, number, number] = [
    element.x + element.width / 2,
    0,
    element.y + element.height / 2,
  ];

  return (
    <group
      onClick={(event) => onSelect(event, element.id)}
      position={position}
      rotation={[0, (-element.rotation * Math.PI) / 180, 0]}
    >
      <FurnitureBody color={color} depth={depth} element={element} height={height} width={width} />
      <SelectionBox depth={depth} height={height} visible={selected} width={width} />
    </group>
  );
});
