"use client";

import { Canvas } from "@react-three/fiber";
import { BvhPhysicsWorld } from "@react-three/viverse";
import { Suspense } from "react";
import { Scene } from "@/components/Scene";

export default function Home() {
  return (
    <BvhPhysicsWorld>
      <Suspense fallback={null}></Suspense>
      <Canvas
        className="fixed! w-screen! h-screen! touch-none"
        shadows
        camera={{ position: [3, 3, 3], fov: 40 }}
        gl={{
          preserveDrawingBuffer: true,
        }}
        flat
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </BvhPhysicsWorld>
  );
}
