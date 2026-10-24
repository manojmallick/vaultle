"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, type ColorId } from "./puzzle";

export interface SceneProps {
  slots: ColorId[];
  selected: number | null;
  solved: boolean;
  onSelect: (index: number) => void;
}

function Block({
  index,
  colorId,
  selected,
  solved,
  onSelect,
}: {
  index: number;
  colorId: ColorId;
  selected: boolean;
  solved: boolean;
  onSelect: (i: number) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const x = (index - 1.5) * 0.55;
  const color = COLORS[colorId];

  useFrame((_, dt) => {
    if (!ref.current) return;
    const targetY = selected ? 1.25 : 1.05;
    ref.current.position.y += (targetY - ref.current.position.y) * Math.min(1, dt * 10);
    if (solved) {
      ref.current.rotation.y += dt * 0.8;
    }
  });

  return (
    <mesh
      ref={ref}
      position={[x, 1.05, -1.4]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
      castShadow
    >
      <boxGeometry args={[0.42, 0.42, 0.42]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={selected || solved ? 0.55 : 0.15}
        metalness={0.25}
        roughness={0.4}
      />
    </mesh>
  );
}

function VaultShell() {
  return (
    <group position={[0, 0.9, -1.85]}>
      <mesh>
        <boxGeometry args={[2.6, 1.4, 0.2]} />
        <meshStandardMaterial color="#1e1b2e" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* four slot frames */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[(i - 1.5) * 0.55, 0.15, 0.15]}>
          <boxGeometry args={[0.48, 0.48, 0.06]} />
          <meshStandardMaterial
            color="#4c1d95"
            transparent
            opacity={0.5}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Spatial Cubism-style vault: arrange 4 colored blocks to match today's lock.
 */
export function Scene({ slots, selected, solved, onSelect }: SceneProps) {
  const floor = useMemo(() => new THREE.Color("#0c0a12"), []);

  return (
    <>
      <color attach="background" args={[floor.getStyle()]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
      <pointLight position={[0, 2.2, -1]} intensity={0.5} color="#f9a8d4" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.2]} receiveShadow>
        <circleGeometry args={[2, 48]} />
        <meshStandardMaterial color="#16121f" roughness={0.9} />
      </mesh>
      <gridHelper args={[4, 16, "#3b3154", "#1f1830"]} position={[0, 0.01, -1.2]} />

      <VaultShell />

      {slots.map((c, i) => (
        <Block
          key={i}
          index={i}
          colorId={c}
          selected={selected === i}
          solved={solved}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
