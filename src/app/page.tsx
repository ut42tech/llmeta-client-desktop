"use client";

import { Stats } from "@react-three/drei";

import { Canvas } from "@react-three/fiber";
import { BvhPhysicsWorld } from "@react-three/viverse";
import { useControls } from "leva";
import { Suspense } from "react";
import { ColyseusManager } from "@/components/ColyseusManager";
import { Scene } from "@/components/Scene";

export default function Home() {
  // debug
  const { stats } = useControls({ stats: true });

  return (
    <>
      <ColyseusManager />
      {stats && <Stats />}
      <BvhPhysicsWorld>
        <Canvas
          className="fixed! w-screen! h-screen! touch-none"
          shadows
          camera={{ position: [3, 3, 3], fov: 40 }}
          gl={{
            preserveDrawingBuffer: true,
          }}
          flat
        >
          <Suspense>
            <Scene />
          </Suspense>
        </Canvas>
      </BvhPhysicsWorld>
    </>
  );
}
