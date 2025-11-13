import { Sky } from "@react-three/drei";
import {
  SimpleCharacter,
  type SimpleCharacterImpl,
} from "@react-three/viverse";
import type { Room } from "colyseus.js";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { DirectionalLight } from "three";
import { DebugPanel } from "@/components/DebugPanel";
import { InfiniteWorld } from "@/components/InfiniteWorld";
import { RemotePlayers } from "@/components/RemotePlayers";
import { LIGHTING } from "@/constants";
import { useCharacterController } from "@/hooks/useCharacterController";
import { useColyseusLifecycle } from "@/hooks/useColyseusLifecycle";
import { useLightController } from "@/hooks/useLightController";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { type MyRoomState, useColyseusRoom } from "@/utils/colyseus";

/**
 * Main scene component.
 * Manages the local player, remote players, and the world.
 */
export const Scene = () => {
  useColyseusLifecycle();

  const room = useColyseusRoom() as Room<MyRoomState> | undefined;
  const [isConnected, setIsConnected] = useState(false);

  const setSessionId = useLocalPlayerStore((state) => state.setSessionId);

  const characterRef = useRef<SimpleCharacterImpl>(null);
  const directionalLightRef = useRef<DirectionalLight | null>(null);

  // Handle character movement, teleport, and sync
  useCharacterController(characterRef, room, isConnected);

  // Handle light following character
  useLightController(characterRef, directionalLightRef);

  // Handle session connection
  useEffect(() => {
    if (room?.sessionId) {
      setSessionId(room.sessionId);
      setIsConnected(true);
      console.log("[Scene] Colyseus connected, session ID:", room.sessionId);
    }
  }, [room?.sessionId, setSessionId]);

  // Light settings
  const directionalLightIntensity = useMemo(
    () => LIGHTING.DIRECTIONAL_INTENSITY,
    [],
  );
  const ambientLightIntensity = useMemo(() => LIGHTING.AMBIENT_INTENSITY, []);

  return (
    <>
      <DebugPanel />

      <Sky />
      <directionalLight
        intensity={directionalLightIntensity}
        position={[-10, 10, -10]}
        castShadow
        ref={directionalLightRef}
      />
      <ambientLight intensity={ambientLightIntensity} />

      {/* Local Player */}
      <Suspense fallback={null}>
        <SimpleCharacter ref={characterRef} />
      </Suspense>

      {/* Remote Players */}
      <Suspense fallback={null}>
        <RemotePlayers />
      </Suspense>

      <Suspense fallback={null}>
        <InfiniteWorld />
      </Suspense>
    </>
  );
};
