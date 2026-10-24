"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Scene } from "./scene";
import type { ColorId } from "./puzzle";

export const xrStore = createXRStore();

export function VaultCanvas(props: {
  slots: ColorId[];
  selected: number | null;
  solved: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 1.4], fov: 55 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true }}
    >
      <XR store={xrStore}>
        <Scene {...props} />
      </XR>
    </Canvas>
  );
}
