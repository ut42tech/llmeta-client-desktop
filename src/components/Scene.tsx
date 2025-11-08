import { Sky, SoftShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  SimpleCharacter,
  type SimpleCharacterImpl,
} from "@react-three/viverse";
import type { Room } from "colyseus.js";
import { useControls } from "leva";
import { Suspense, useEffect, useRef, useState } from "react";
import { type DirectionalLight, Euler, Vector3 } from "three";
import { DebugPanel } from "@/components/DebugPanel";
import { InfiniteWorld } from "@/components/InfiniteWorld";
import { RemotePlayers } from "@/components/RemotePlayers";
import { useColyseusLifecycle } from "@/hooks/useColyseusLifecycle";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useWorldStore } from "@/stores/worldStore";
import { useColyseusRoom } from "@/utils/colyseus";

const LIGHT_OFFSET = new Vector3(2, 5, 2);
const tmpVec = new Vector3();

export const Scene = () => {
  // debug
  const { softShadows } = useControls({ softShadows: true });

  useColyseusLifecycle();

  const room = useColyseusRoom();
  const [isConnected, setIsConnected] = useState(false);

  const setSessionId = useLocalPlayerStore((state) => state.setSessionId);
  const setPosition = useLocalPlayerStore((state) => state.setPosition);
  const setRotation = useLocalPlayerStore((state) => state.setRotation);
  const setAction = useLocalPlayerStore((state) => state.setAction);
  const sendMovement = useLocalPlayerStore((state) => state.sendMovement);

  const updateCurrentGridCell = useWorldStore(
    (state) => state.updateCurrentGridCell,
  );
  const characterRef = useRef<SimpleCharacterImpl>(null);
  const directionalLight = useRef<DirectionalLight | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (room?.sessionId) {
      setSessionId(room.sessionId);
      setIsConnected(true);
      console.log("[Scene] Colyseus connected, session ID:", room.sessionId);
    }
  }, [room?.sessionId, setSessionId]);

  useEffect(() => {
    const light = directionalLight.current;
    if (!light) {
      return;
    }

    scene.add(light.target);
    return () => {
      scene.remove(light.target);
    };
  }, [scene]);

  useFrame(() => {
    const character = characterRef.current;
    const light = directionalLight.current;

    if (!character || !light) {
      return;
    }

    // Reset position if fallen below threshold
    if (character.position.y < -10) {
      character.position.copy(new Vector3());
    }

    // Update player position and grid cell independently (always update locally)
    setPosition(character.position);
    setRotation(character.model?.scene.rotation || new Euler());

    // Determine current animation state based on active action
    setAction(character.actions);

    // Send movement update to server only if connected
    if (isConnected && room) {
      sendMovement((room as unknown as Room) || undefined);
    }

    updateCurrentGridCell(character.position);

    // Keep the light aligned with the character so shadows stay accurate
    light.target.position.copy(character.position);
    tmpVec.copy(light.target.position).add(LIGHT_OFFSET);
    light.position.copy(tmpVec);
  });

  return (
    <>
      <DebugPanel />

      {softShadows && <SoftShadows />}

      <Sky />
      <directionalLight
        intensity={1.2}
        position={[-10, 10, -10]}
        castShadow
        ref={directionalLight}
      />
      <ambientLight intensity={1} />

      {/* Local Player */}
      <Suspense>
        <SimpleCharacter ref={characterRef} />
      </Suspense>

      {/* Remote Players */}
      <Suspense>
        <RemotePlayers />
      </Suspense>

      <Suspense>
        <InfiniteWorld />
      </Suspense>
    </>
  );
};
