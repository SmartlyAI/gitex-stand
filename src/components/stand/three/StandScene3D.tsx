"use client";

import { useMemo } from "react";
import { ContactShadows, Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { getStandFloorPalette, getStandPlatformMetrics } from "@/lib/stand-floor";
import { StandDimensions, StandElement, StandFloorSettings } from "@/lib/types";
import { AssetPlane } from "./AssetPlane";
import { StandFurnitureModel } from "./StandFurnitureModel";

interface StandScene3DProps {
  dimensions: StandDimensions;
  floorSettings: StandFloorSettings;
  elements: StandElement[];
  gridSize: number;
  selectedElementIds: string[];
  showGrid: boolean;
  onSelectElement: (event: ThreeEvent<MouseEvent>, elementId: string) => void;
  cameraRef?: React.Ref<THREE.PerspectiveCamera>;
  controlsRef?: React.Ref<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function FloorGrid({ depth, gridSize, showGrid, topY, width }: { depth: number; gridSize: number; showGrid: boolean; topY: number; width: number }) {
  const lines = useMemo(() => {
    if (!showGrid) {
      return [];
    }

    const step = Math.max(gridSize / 100, 0.25);
    const nextLines: Array<{ key: string; points: [number, number, number][] }> = [];

    for (let x = step; x < width; x += step) {
      nextLines.push({
        key: `vx-${x.toFixed(2)}`,
        points: [
          [x, topY + 0.002, 0],
          [x, topY + 0.002, depth],
        ],
      });
    }

    for (let z = step; z < depth; z += step) {
      nextLines.push({
        key: `hz-${z.toFixed(2)}`,
        points: [
          [0, topY + 0.002, z],
          [width, topY + 0.002, z],
        ],
      });
    }

    return nextLines;
  }, [depth, gridSize, showGrid, topY, width]);

  if (!showGrid) {
    return null;
  }

  return (
    <group>
      {lines.map((line) => (
        <Line color="#cbd5e1" key={line.key} lineWidth={0.6} points={line.points} transparent opacity={0.45} />
      ))}
    </group>
  );
}

function StandShell({ depth, floorSettings, width }: { depth: number; floorSettings: StandFloorSettings; width: number }) {
  const { thickness, topY } = getStandPlatformMetrics(floorSettings);
  const palette = getStandFloorPalette(floorSettings);
  const ledColor = floorSettings.ledColor ?? "#a855f7";
  const plankLines = useMemo(() => {
    if (floorSettings.finish !== "parquet") {
      return [] as Array<{ key: string; points: [number, number, number][] }>;
    }

    const verticals: Array<{ key: string; points: [number, number, number][] }> = [];
    for (let x = 0.18; x < width; x += 0.18) {
      verticals.push({
        key: `plank-v-${x.toFixed(2)}`,
        points: [
          [x, topY + 0.003, 0],
          [x, topY + 0.003, depth],
        ],
      });
    }

    for (let z = 0.9; z < depth; z += 0.9) {
      verticals.push({
        key: `plank-h-${z.toFixed(2)}`,
        points: [
          [0, topY + 0.003, z],
          [width, topY + 0.003, z],
        ],
      });
    }

    return verticals;
  }, [depth, floorSettings.finish, topY, width]);

  return (
    <group>
      <mesh name="stand-floor" position={[width / 2, topY - thickness / 2, depth / 2]} receiveShadow>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color={palette.surfaceColor} metalness={floorSettings.finish === "parquet" ? 0.08 : 0.04} roughness={palette.roughness} />
      </mesh>

      {floorSettings.finish === "parquet" && floorSettings.textureAsset ? (
        <group position={[width / 2, topY + 0.004, depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <AssetPlane
            asset={floorSettings.textureAsset}
            height={depth}
            preserveAspectRatio={false}
            repeatX={Math.max(width / 1.6, 1)}
            repeatY={Math.max(depth / 1.6, 1)}
            tone="#ffffff"
            width={width}
          />
        </group>
      ) : null}

      <mesh position={[width / 2, topY - 0.03, depth + 0.045]}>
        <boxGeometry args={[width, 0.06, 0.03]} />
        <meshStandardMaterial color={palette.trimColor} metalness={0.1} roughness={0.42} />
      </mesh>

      {floorSettings.finish === "moquette" && (
        <mesh position={[width / 2, topY + 0.002, depth / 2]} receiveShadow>
          <boxGeometry args={[width * 0.995, 0.004, depth * 0.995]} />
          <meshStandardMaterial color={palette.sheenColor} roughness={1} />
        </mesh>
      )}

      {/* Liseré LED faisant le tour du stand */}
      <mesh position={[width / 2, topY, depth + 0.065]}>
        <boxGeometry args={[width, 0.015, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[width + 0.005, topY, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.015, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.005, topY, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.015, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[width / 2, topY, -0.005]}>
        <boxGeometry args={[width, 0.015, 0.01]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>

      {plankLines.map((line) => (
        <Line color={palette.edgeColor} key={line.key} lineWidth={0.5} points={line.points} transparent opacity={0.38} />
      ))}
    </group>
  );
}

export function StandScene3D({
  dimensions,
  floorSettings,
  elements,
  gridSize,
  onSelectElement,
  selectedElementIds,
  showGrid,
  cameraRef,
  controlsRef,
}: StandScene3DProps) {
  const maxSide = Math.max(dimensions.width, dimensions.depth);
  const { topY: floorTopY } = getStandPlatformMetrics(floorSettings);
  const visibleElements = useMemo(
    () => elements.filter((element) => element.category !== "texte"),
    [elements]
  );
  const selectedIds = useMemo(() => new Set(selectedElementIds), [selectedElementIds]);
  const cameraPosition: [number, number, number] = [
    dimensions.width / 2 + maxSide * 0.45,
    maxSide * 0.62 + floorTopY * 0.6,
    -maxSide * 0.72, // Z négatif pour regarder vers le sud (le haut du plan est à Z=0)
  ];

  return (
    <>
      <color args={["#eef2ff"]} attach="background" />
      <fog args={["#eef2ff", maxSide * 4, maxSide * 10]} attach="fog" />

      <PerspectiveCamera makeDefault fov={52} position={cameraPosition} ref={cameraRef} />
      <OrbitControls
        ref={controlsRef}
        autoRotate={false}
        enableDamping
        enablePan
        dampingFactor={0.08}
        maxDistance={maxSide * 8}
        maxPolarAngle={Math.PI / 1.92}
        minDistance={0.8}
        minPolarAngle={0.08}
        panSpeed={1.15}
        rotateSpeed={0.82}
        screenSpacePanning
        target={[dimensions.width / 2, floorTopY + 0.55, dimensions.depth / 2]}
        zoomSpeed={0.95}
      />

      <ambientLight intensity={1.18} />
      <hemisphereLight args={["#ffffff", "#dbeafe", 1.2]} position={[0, 8, 0]} />
      <directionalLight castShadow intensity={2.4} position={[dimensions.width * 0.15, 7.5, -dimensions.depth * 0.35]} shadow-mapSize-height={2048} shadow-mapSize-width={2048} shadow-camera-bottom={-10} shadow-camera-far={24} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} />
      <spotLight angle={0.52} castShadow intensity={48} penumbra={0.55} position={[dimensions.width / 2, 8.5, dimensions.depth / 2]} />

      <StandShell depth={dimensions.depth} floorSettings={floorSettings} width={dimensions.width} />
      <FloorGrid depth={dimensions.depth} gridSize={gridSize} showGrid={showGrid} topY={floorTopY} width={dimensions.width} />

      <group position={[0, floorTopY, 0]}>
        {visibleElements.map((element) => (
          <StandFurnitureModel
            element={element}
            key={element.id}
            onSelect={onSelectElement}
            selected={selectedIds.has(element.id)}
          />
        ))}
      </group>

      <ContactShadows blur={2.5} color="#94a3b8" frames={1} opacity={0.28} position={[dimensions.width / 2, floorTopY + 0.001, dimensions.depth / 2]} scale={Math.max(dimensions.width, dimensions.depth) * 1.35} />
    </>
  );
}
