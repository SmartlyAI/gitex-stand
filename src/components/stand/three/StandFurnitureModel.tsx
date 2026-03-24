"use client";

import { memo } from "react";
import { Edges, RoundedBox } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { DoubleSide } from "three";
import { StandElement } from "@/lib/types";
import { StandPlantModel } from "./StandPlantModel";
import { MiniBarLogoCrown as MiniBarLogoCrownModel } from "./MiniBarLogoCrown";
import { getElementFootprint, getElementHeight, tone } from "./model-utils";
import { useStandStore } from "@/lib/store";

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

  // Base configuration assumes storage on the right
  let supportX = -width / 2 + supportThickness / 2 + 0.05;
  let storageX = width / 2 - storageWidth / 2 - 0.02;

  // Flip if orientation is left
  if (storageOrientation === "left") {
    supportX = width / 2 - supportThickness / 2 - 0.05;
    storageX = -width / 2 + storageWidth / 2 + 0.02;
  }

  return (
    <>
      <RoundedBox args={[width, 0.08, depth]} castShadow position={[0, tableHeight - 0.04, 0]} radius={0.03} receiveShadow smoothness={4}>
        <meshStandardMaterial color={tone(color, 0.16)} roughness={0.4} />
      </RoundedBox>
      <mesh castShadow position={[supportX, tableHeight / 2 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[supportThickness, tableHeight - 0.08, depth * 0.7]} />
        <meshStandardMaterial color={tone(color, -0.06)} roughness={0.65} />
      </mesh>
      <mesh castShadow position={[storageX, tableHeight / 2 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[storageWidth, tableHeight - 0.08, depth * 0.8]} />
        <meshStandardMaterial color={tone(color, -0.12)} roughness={0.7} />
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
  const partitionWidth = Math.max(width * 0.96, 0.56);
  const partitionDepth = Math.max(depth * 0.28, 0.08);
  const isDoubleSided = element.tvScreenMode === "double";
  const screenOneSize = getScreenSizeFromInches(element.tvScreen1Inches ?? 55);
  const screenTwoSize = getScreenSizeFromInches(
    element.tvScreen2Inches ?? element.tvScreen1Inches ?? 55
  );
  const screenOneCenterY = element.tvScreen1CenterY ?? 1.45;
  const screenTwoCenterY = element.tvScreen2CenterY ?? element.tvScreen1CenterY ?? 1.45;
  const frontScreenZ = partitionDepth / 2 + 0.06;
  const backScreenZ = -partitionDepth / 2 - 0.06;

  return (
    <>
      <RoundedBox args={[partitionWidth, height, partitionDepth]} castShadow position={[0, height / 2, 0]} radius={0.02} receiveShadow smoothness={4}>
        <meshStandardMaterial color="#f8fafc" roughness={0.76} />
      </RoundedBox>

      <mesh position={[0, height * 0.48, partitionDepth / 2 + 0.004]}>
        <planeGeometry args={[partitionWidth * 0.84, height * 0.94]} />
        <meshStandardMaterial color={tone(color, 0.12)} emissive={tone(color, 0.03)} emissiveIntensity={0.05} side={DoubleSide} />
      </mesh>
      <mesh position={[0, height * 0.84, partitionDepth / 2 + 0.005]}>
        <planeGeometry args={[partitionWidth * 0.76, height * 0.12]} />
        <meshStandardMaterial color="#ffffff" side={DoubleSide} />
      </mesh>
      <mesh position={[0, height * 0.22, partitionDepth / 2 + 0.005]}>
        <planeGeometry args={[partitionWidth * 0.76, height * 0.24]} />
        <meshStandardMaterial color={tone(color, 0.26)} emissive={tone(color, 0.1)} emissiveIntensity={0.08} side={DoubleSide} />
      </mesh>

      <mesh castShadow position={[0, screenOneCenterY, partitionDepth / 2 + 0.03]} receiveShadow>
        <boxGeometry args={[0.08, 0.12, 0.02]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.26} roughness={0.38} />
      </mesh>
      <RoundedBox args={[screenOneSize.width, screenOneSize.height, 0.05]} castShadow position={[0, screenOneCenterY, frontScreenZ]} radius={0.018} receiveShadow smoothness={4}>
        <meshStandardMaterial color="#0f172a" metalness={0.14} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, screenOneCenterY, frontScreenZ + 0.028]}>
        <planeGeometry args={[screenOneSize.width * 0.9, screenOneSize.height * 0.82]} />
        <meshStandardMaterial color="#111827" emissive="#1d4ed8" emissiveIntensity={0.08} side={DoubleSide} />
      </mesh>

      {isDoubleSided && (
        <>
          <mesh castShadow position={[0, screenTwoCenterY, -partitionDepth / 2 - 0.03]} receiveShadow>
            <boxGeometry args={[0.08, 0.12, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.26} roughness={0.38} />
          </mesh>
          <RoundedBox args={[screenTwoSize.width, screenTwoSize.height, 0.05]} castShadow position={[0, screenTwoCenterY, backScreenZ]} radius={0.018} receiveShadow smoothness={4}>
            <meshStandardMaterial color="#0f172a" metalness={0.14} roughness={0.28} />
          </RoundedBox>
          <mesh position={[0, screenTwoCenterY, backScreenZ - 0.028]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[screenTwoSize.width * 0.9, screenTwoSize.height * 0.82]} />
            <meshStandardMaterial color="#111827" emissive="#2563eb" emissiveIntensity={0.08} side={DoubleSide} />
          </mesh>
        </>
      )}

      <mesh castShadow position={[0, 0.025, depth * 0.22]} receiveShadow>
        <boxGeometry args={[partitionWidth * 0.58, 0.03, 0.08]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 0.025, -depth * 0.22]} receiveShadow>
        <boxGeometry args={[partitionWidth * 0.58, 0.03, 0.08]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.72} />
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
  const { floorSettings } = useStandStore();
  const ledColor = floorSettings.ledColor ?? "#a855f7";

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
    case "mini_bar_couronne_logo":
      return <MiniBarLogoCrown color={color} depth={depth} element={element} height={height} width={width} ledColor={ledColor} />;
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
