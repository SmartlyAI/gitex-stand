"use client";

import { tone } from "./model-utils";

interface StandPlantModelProps {
  color: string;
  height: number;
}

const LEAF_LAYOUT: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  toneAmount: number;
}> = [
  // Bas
  { position: [0.2, 0.8, 0.05], rotation: [0.22, 0.2, 0.72], scale: [0.16, 0.45, 0.04], toneAmount: 0.08 },
  { position: [-0.22, 0.85, -0.08], rotation: [-0.18, -0.24, -0.68], scale: [0.18, 0.5, 0.04], toneAmount: -0.04 },
  { position: [0.05, 0.75, 0.2], rotation: [0.6, 0.1, 0.1], scale: [0.15, 0.4, 0.04], toneAmount: 0.1 },
  // Milieu
  { position: [0.12, 1.1, 0.18], rotation: [0.38, 0.56, 0.32], scale: [0.14, 0.4, 0.04], toneAmount: 0.14 },
  { position: [-0.15, 1.15, 0.15], rotation: [0.34, -0.52, -0.28], scale: [0.12, 0.35, 0.04], toneAmount: 0.02 },
  { position: [0.25, 1.25, -0.12], rotation: [-0.28, 0.62, 0.24], scale: [0.13, 0.38, 0.04], toneAmount: -0.08 },
  { position: [-0.28, 1.2, 0.08], rotation: [0.24, -0.58, -0.3], scale: [0.15, 0.42, 0.04], toneAmount: 0.12 },
  { position: [0.05, 1.18, -0.22], rotation: [-0.4, -0.1, -0.1], scale: [0.12, 0.35, 0.04], toneAmount: -0.06 },
  // Haut
  { position: [0.06, 1.45, -0.04], rotation: [0.14, 0.16, 0.08], scale: [0.14, 0.45, 0.04], toneAmount: -0.02 },
  { position: [-0.06, 1.38, -0.2], rotation: [-0.34, -0.18, -0.12], scale: [0.13, 0.38, 0.04], toneAmount: 0.06 },
  { position: [0.14, 1.4, 0.08], rotation: [0.2, 0.4, 0.3], scale: [0.11, 0.35, 0.04], toneAmount: 0.15 },
  { position: [-0.12, 1.48, 0.1], rotation: [0.25, -0.3, -0.2], scale: [0.12, 0.4, 0.04], toneAmount: 0.04 },
];

export function StandPlantModel({ color, height }: StandPlantModelProps) {
  const plantHeight = Math.max(height, 1.35);
  const verticalScale = Math.min(plantHeight / 1.55, 1.22);

  return (
    <group scale={[1.1, verticalScale, 1.1]}>
      {/* Pot plus réaliste et élégant (cylindre légèrement évasé avec rebord) */}
      <group position={[0, 0.22, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.44, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.15} roughness={0.35} />
        </mesh>
        {/* Liseré fin en haut du pot */}
        <mesh castShadow position={[0, 0.21, 0]} receiveShadow>
          <cylinderGeometry args={[0.23, 0.22, 0.04, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.3} />
        </mesh>
        {/* Terreau */}
        <mesh position={[0, 0.19, 0]} receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 28]} />
          <meshStandardMaterial color="#2c1e16" roughness={0.95} />
        </mesh>
      </group>

      {[
        { position: [0, 0.74, 0], rotation: [0.04, 0.12, 0] },
        { position: [0.08, 0.9, 0.04], rotation: [-0.12, 0.18, 0.16] },
        { position: [-0.1, 0.88, -0.02], rotation: [0.14, -0.16, -0.12] },
      ].map((stem, index) => (
        <mesh
          castShadow
          key={`stem-${index}`}
          position={stem.position as [number, number, number]}
          rotation={stem.rotation as [number, number, number]}
        >
          <cylinderGeometry args={[0.014, 0.02, 0.72, 12]} />
          <meshStandardMaterial color="#6b4f3a" roughness={0.84} />
        </mesh>
      ))}

      {LEAF_LAYOUT.map((leaf, index) => (
        <mesh
          castShadow
          key={`leaf-${index}`}
          position={leaf.position}
          rotation={leaf.rotation}
          scale={leaf.scale}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color={tone(color, leaf.toneAmount)} roughness={0.78} />
        </mesh>
      ))}
    </group>
  );
}
