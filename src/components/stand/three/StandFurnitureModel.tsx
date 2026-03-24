"use client";

import { memo } from "react";
import { Edges, RoundedBox } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";
import { StandElement } from "@/lib/types";
import { StandPlantModel } from "./StandPlantModel";
import { MiniBarLogoCrown as MiniBarLogoCrownModel } from "./MiniBarLogoCrown";
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

function Stool({ depth, height, width }: { depth: number; height: number; width: number }) {
  const seatHeight = 0.06;
  const seatWidth = width * 0.92;
  const seatDepth = depth * 0.92;
  const legHeight = Math.max(height - seatHeight - 0.05, 0.6);
  const legX = Math.max(seatWidth / 2 - 0.05, 0.08);
  const legZ = Math.max(seatDepth / 2 - 0.05, 0.08);
  const stretcherY = Math.min(0.29, legHeight * 0.42);

  return (
    <>
      <RoundedBox args={[seatWidth, seatHeight, seatDepth]} castShadow position={[0, height - seatHeight / 2, 0]} radius={0.035} receiveShadow smoothness={4}>
        <meshStandardMaterial color="#f8fafc" metalness={0.04} roughness={0.34} />
      </RoundedBox>
      <mesh castShadow position={[0, height - seatHeight - 0.03, 0]} receiveShadow>
        <boxGeometry args={[seatWidth * 0.46, 0.028, seatDepth * 0.46]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.48} />
      </mesh>

      {[
        [legX, legHeight / 2, legZ],
        [legX, legHeight / 2, -legZ],
        [-legX, legHeight / 2, legZ],
        [-legX, legHeight / 2, -legZ],
      ].map((position, index) => (
        <mesh castShadow key={index} position={position as [number, number, number]} receiveShadow>
          <cylinderGeometry args={[0.02, 0.024, legHeight, 18]} />
          <meshStandardMaterial color="#b98a5f" roughness={0.7} />
        </mesh>
      ))}

      {[
        [0, stretcherY, legZ * 0.84, seatWidth * 0.6, 0.028, 0.024],
        [0, stretcherY, -legZ * 0.84, seatWidth * 0.6, 0.028, 0.024],
        [legX * 0.84, stretcherY, 0, 0.024, 0.028, seatDepth * 0.6],
        [-legX * 0.84, stretcherY, 0, 0.024, 0.028, seatDepth * 0.6],
      ].map((args, index) => (
        <mesh castShadow key={`stretcher-${index}`} position={[args[0], args[1], args[2]] as [number, number, number]} receiveShadow>
          <boxGeometry args={[args[3], args[4], args[5]]} />
          <meshStandardMaterial color="#c28f64" roughness={0.68} />
        </mesh>
      ))}
    </>
  );
}

function DemoTable({ color, depth, height, width, storageOrientation = "right" }: { color: string; depth: number; height: number; width: number; storageOrientation?: "left" | "right" }) {
  const tableHeight = Math.max(height, 0.9);
  const supportThickness = Math.min(width, depth) * 0.15;
  const storageWidth = width * 0.35;
  const basePlinthHeight = 0.08;

  // Les meubles de support vont jusqu'aux bords de la zone pour permettre le "coller" parfait
  let supportX = -width / 2 + supportThickness / 2;
  let storageX = width / 2 - storageWidth / 2;
  let lockX = storageX;
  const lockZ = depth / 2 + 0.005; // Offset to sit on the front face of the storage unit

  // Flip if orientation is left
  if (storageOrientation === "left") {
    supportX = width / 2 - supportThickness / 2;
    storageX = -width / 2 + storageWidth / 2;
    lockX = storageX;
  }

  return (
    <>
      {/* Plateau supérieur en bois (comme le haut du mini-bar) collé aux bords */}
      <mesh castShadow position={[0, tableHeight - 0.04, 0]} receiveShadow>
        <boxGeometry args={[width, 0.08, depth]} />
        <meshStandardMaterial color={tone("#d2a679", 0.1)} metalness={0.12} roughness={0.4} />
      </mesh>
      
      {/* Joue latérale en bois */}
      <mesh castShadow position={[supportX, tableHeight / 2 + basePlinthHeight / 2 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[supportThickness, tableHeight - 0.08 - basePlinthHeight, depth]} />
        <meshStandardMaterial color="#c28f64" metalness={0.08} roughness={0.5} />
      </mesh>
      
      {/* Plinthe de base claire sous la joue en bois */}
      <mesh castShadow position={[supportX, basePlinthHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[supportThickness, basePlinthHeight, depth]} />
        <meshStandardMaterial color={tone(color, 0.2)} roughness={0.4} />
      </mesh>
      
      {/* Rangement fermé (utilise la couleur personnalisée) */}
      <mesh castShadow position={[storageX, tableHeight / 2 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[storageWidth, tableHeight - 0.08, depth]} />
        <meshStandardMaterial color={tone(color, -0.12)} roughness={0.7} />
      </mesh>

      {/* Serrure de la porte de rangement (face avant) */}
      <mesh castShadow position={[lockX + storageWidth * 0.25, tableHeight * 0.75, lockZ]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Fente de la serrure */}
      <mesh castShadow position={[lockX + storageWidth * 0.25, tableHeight * 0.75, lockZ + 0.006]} receiveShadow>
        <boxGeometry args={[0.004, 0.012, 0.002]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      
      {/* Ligne de séparation des portes */}
      <mesh castShadow position={[lockX, tableHeight / 2 - 0.04, lockZ]} receiveShadow>
        <boxGeometry args={[0.004, tableHeight - 0.1, 0.004]} />
        <meshStandardMaterial color={tone(color, -0.2)} roughness={0.8} />
      </mesh>
    </>
  );
}

function MiniBarLogoCrown({ color, depth, element, height, width, ledColor }: { color: string; depth: number; element: StandElement; height: number; width: number; ledColor: string }) {
  return (
    <MiniBarLogoCrownModel
      color={color}
      depth={depth}
      element={element}
      height={height}
      width={width}
      ledColor={ledColor}
    />
  );
}

function getScreenSizeFromInches(inches: number) {
  const safeInches = Math.max(24, Math.min(inches, 120));
  const diagonalMeters = safeInches * 0.0254;
  const aspectWidth = 16;
  const aspectHeight = 9;
  const ratio = Math.sqrt(aspectWidth ** 2 + aspectHeight ** 2);
  const rawWidth = (diagonalMeters * aspectWidth) / ratio;
  const rawHeight = (diagonalMeters * aspectHeight) / ratio;

  return {
    height: rawHeight,
    width: rawWidth,
  };
}

function PartitionTv({ color, depth, element, height, width }: { color: string; depth: number; element: StandElement; height: number; width: number }) {
  const panelHeight = Math.max(height, 2.2);
  const panelThickness = depth;
  const tvMode = element.tvScreenMode ?? "none";
  const screen1Inches = element.tvScreen1Inches ?? 42;
  const screen2Inches = element.tvScreen2Inches ?? 42;
  const screen1CenterY = element.tvScreen1CenterY ?? 1.5;
  const screen2CenterY = element.tvScreen2CenterY ?? 1.5;

  const { height: tv1Height, width: tv1Width } = getScreenSizeFromInches(screen1Inches);
  const { height: tv2Height, width: tv2Width } = getScreenSizeFromInches(screen2Inches);

  return (
    <>
      <RoundedBox args={[width, panelHeight, panelThickness]} castShadow position={[0, panelHeight / 2, 0]} radius={0.03} receiveShadow smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.08} roughness={0.4} />
      </RoundedBox>

      {(tvMode === "single" || tvMode === "double") && (
        <group position={[0, screen1CenterY, panelThickness / 2 + 0.015]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[tv1Width, tv1Height, 0.03]} />
            <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <planeGeometry args={[tv1Width * 0.96, tv1Height * 0.92]} />
            <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {tvMode === "double" && (
        <group position={[0, screen2CenterY, -panelThickness / 2 - 0.015]} rotation={[0, Math.PI, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[tv2Width, tv2Height, 0.03]} />
            <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <planeGeometry args={[tv2Width * 0.96, tv2Height * 0.92]} />
            <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Tiges décoratives latérales */}
      <mesh castShadow position={[width / 2 - 0.02, panelHeight / 2, depth / 2 + 0.01]} receiveShadow>
        <cylinderGeometry args={[0.008, 0.008, panelHeight * 0.96, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.42} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[-width / 2 + 0.02, panelHeight / 2, depth / 2 + 0.01]} receiveShadow>
        <cylinderGeometry args={[0.008, 0.008, panelHeight * 0.96, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.42} roughness={0.3} />
      </mesh>
    </>
  );
}

function Plant({ color, height }: { color: string; height: number }) {
  return <StandPlantModel color={color} height={height} />;
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
    case "mini_bar_couronne_logo": {
      const ledColor = element.ledColor ?? "#a855f7";
      return <MiniBarLogoCrown color={color} depth={depth} element={element} height={height} width={width} ledColor={ledColor} />;
    }
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
      return <Stool depth={depth} height={height} width={width} />;
    case "pouf":
      return (
        <mesh castShadow position={[0, height / 2, 0]} receiveShadow>
          <cylinderGeometry args={[Math.min(width, depth) * 0.48, Math.min(width, depth) * 0.5, height, 28]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      );
    case "table_demo":
      return <DemoTable color={color} depth={depth} height={height} width={width} storageOrientation={element.storageOrientation} />;
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
      return <PartitionTv color={color} depth={depth} element={element} height={height} width={width} />;
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
