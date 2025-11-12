"use client";

import { Loader, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { OverlayUI } from "@/components/overlay/OverlayUI";
import { Scene } from "@/components/Scene";

const Viverse = dynamic(
  () => import("@react-three/viverse").then((mod) => mod.Viverse),
  { ssr: false },
);

export default function Home() {
  // debug
  const { stats } = useControls({ stats: false });

  return (
    <>
      <Loader />
      {stats && <Stats />}

      <OverlayUI />

      <Viverse clientId={process.env.NEXT_PUBLIC_VIVERSE_APP_ID || undefined}>
        <Canvas
          className="fixed! w-screen! h-screen! touch-none"
          shadows
          camera={{ position: [3, 3, 3], fov: 40 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          flat
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </Viverse>
    </>
  );
}
