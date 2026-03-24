"use client";

import { useMemo } from "react";
import { ContactShadows, Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { StandDimensions, StandElement } from "@/lib/types";
import { StandFurnitureModel } from "./StandFurnitureModel";

interface StandScene3DProps {
  dimensions: StandDimensions;
  elements: StandElement[];
  gridSize: number;
  selectedElementIds: string[];
  showGrid: boolean;
  onSelectElement: (event: ThreeEvent<MouseEvent>, elementId: string) => void;
}

function FloorGrid({ depth, gridSize, showGrid, width }: { depth: number; gridSize: number; showGrid: boolean; width: number }) {
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
          [x, 0.012, 0],
          [x, 0.012, depth],
        ],
      });
    }

    for (let z = step; z < depth; z += step) {
      nextLines.push({
        key: `hz-${z.toFixed(2)}`,
        points: [
          [0, 0.012, z],
          [width, 0.012, z],
        ],
      });
    }

    return nextLines;
  }, [depth, gridSize, showGrid, width]);

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

function StandShell({ depth, width }: { depth: number; width: number }) {
  return (
    <group>
      <mesh name="stand-floor" position={[width / 2, 0, depth / 2]} receiveShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.04} roughness={0.88} />
      </mesh>

      <mesh position={[width / 2, 0.03, depth + 0.045]}>
        <boxGeometry args={[width, 0.06, 0.03]} />
        <meshStandardMaterial color="#d97706" metalness={0.1} roughness={0.42} />
      </mesh>
    </group>
  );
}

export function StandScene3D({
  dimensions,
  elements,
  gridSize,
  onSelectElement,
  selectedElementIds,
  showGrid,
}: StandScene3DProps) {
  const maxSide = Math.max(dimensions.width, dimensions.depth);
  const visibleElements = useMemo(
    () => elements.filter((element) => element.category !== "texte"),
    [elements]
  );
  const selectedIds = useMemo(() => new Set(selectedElementIds), [selectedElementIds]);
  const cameraPosition: [number, number, number] = [
    dimensions.width / 2 + maxSide * 0.45,
    maxSide * 0.62,
    dimensions.depth + maxSide * 0.72,
  ];

  return (
    <>
      <color args={["#eef2ff"]} attach="background" />
      <fog args={["#eef2ff", maxSide * 4, maxSide * 10]} attach="fog" />

      <PerspectiveCamera makeDefault fov={52} position={cameraPosition} />
      <OrbitControls
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
        target={[dimensions.width / 2, 0.55, dimensions.depth / 2]}
        zoomSpeed={0.95}
      />

      <ambientLight intensity={1.18} />
      <hemisphereLight args={["#ffffff", "#dbeafe", 1.2]} position={[0, 8, 0]} />
      <directionalLight castShadow intensity={2.4} position={[dimensions.width * 0.15, 7.5, -dimensions.depth * 0.35]} shadow-mapSize-height={2048} shadow-mapSize-width={2048} shadow-camera-bottom={-10} shadow-camera-far={24} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} />
      <spotLight angle={0.52} castShadow intensity={48} penumbra={0.55} position={[dimensions.width / 2, 8.5, dimensions.depth / 2]} />

      <StandShell depth={dimensions.depth} width={dimensions.width} />
      <FloorGrid depth={dimensions.depth} gridSize={gridSize} showGrid={showGrid} width={dimensions.width} />

      {visibleElements.map((element) => (
        <StandFurnitureModel
          element={element}
          key={element.id}
          onSelect={onSelectElement}
          selected={selectedIds.has(element.id)}
        />
      ))}

      <ContactShadows blur={2.5} color="#94a3b8" frames={1} opacity={0.28} position={[dimensions.width / 2, 0.001, dimensions.depth / 2]} scale={Math.max(dimensions.width, dimensions.depth) * 1.35} />
    </>
  );
}
