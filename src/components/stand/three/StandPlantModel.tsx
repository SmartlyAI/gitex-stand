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
  { position: [0.16, 0.7, 0.02], rotation: [0.22, 0.2, 0.72], scale: [0.12, 0.34, 0.05], toneAmount: 0.08 },
  { position: [-0.18, 0.72, -0.04], rotation: [-0.18, -0.24, -0.68], scale: [0.12, 0.38, 0.05], toneAmount: -0.04 },
  { position: [0.08, 0.96, 0.14], rotation: [0.38, 0.56, 0.32], scale: [0.14, 0.46, 0.06], toneAmount: 0.14 },
  { position: [-0.1, 0.98, 0.12], rotation: [0.34, -0.52, -0.28], scale: [0.13, 0.42, 0.06], toneAmount: 0.02 },
  { position: [0.2, 1.08, -0.08], rotation: [-0.28, 0.62, 0.24], scale: [0.12, 0.4, 0.05], toneAmount: -0.08 },
  { position: [-0.22, 1.1, 0.06], rotation: [0.24, -0.58, -0.3], scale: [0.14, 0.44, 0.06], toneAmount: 0.12 },
  { position: [0.04, 1.26, -0.02], rotation: [0.14, 0.16, 0.08], scale: [0.15, 0.5, 0.07], toneAmount: -0.02 },
  { position: [-0.04, 1.2, -0.16], rotation: [-0.34, -0.18, -0.12], scale: [0.12, 0.36, 0.05], toneAmount: 0.06 },
];

export function StandPlantModel({ color, height }: StandPlantModelProps) {
  const plantHeight = Math.max(height, 1.35);
  const verticalScale = Math.min(plantHeight / 1.55, 1.22);

  return (
    <group scale={[1, verticalScale, 1]}>
      <mesh castShadow position={[0, 0.16, 0]} receiveShadow>
        <cylinderGeometry args={[0.16, 0.19, 0.24, 26]} />
        <meshStandardMaterial color="#8b5a3c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.27, 0]} receiveShadow>
        <cylinderGeometry args={[0.128, 0.128, 0.03, 24]} />
        <meshStandardMaterial color="#4b2e1f" roughness={0.98} />
      </mesh>

      {[
        { position: [0, 0.64, 0], rotation: [0.04, 0.12, 0] },
        { position: [0.08, 0.8, 0.04], rotation: [-0.12, 0.18, 0.16] },
        { position: [-0.1, 0.78, -0.02], rotation: [0.14, -0.16, -0.12] },
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
