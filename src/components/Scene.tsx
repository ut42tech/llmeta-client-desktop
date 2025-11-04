import { Sky, SoftShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  SimpleCharacter,
  type SimpleCharacterImpl,
} from "@react-three/viverse";
import { useControls } from "leva";
import { Suspense, useEffect, useRef } from "react";
import { type DirectionalLight, Euler, Vector3 } from "three";
import { DebugPanel } from "@/components/DebugPanel";
import { InfiniteWorld } from "@/components/InfiniteWorld";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useWorldStore } from "@/stores/worldStore";

const LIGHT_OFFSET = new Vector3(2, 5, 2);
const tmpVec = new Vector3();

export const Scene = () => {
  // debug
  const { softShadows } = useControls({ softShadows: true });

  const setPosition = useLocalPlayerStore((state) => state.setPosition);
  const setRotation = useLocalPlayerStore((state) => state.setRotation);
  const setAction = useLocalPlayerStore((state) => state.setAction);

  const updateCurrentGridCell = useWorldStore(
    (state) => state.updateCurrentGridCell,
  );
  const characterRef = useRef<SimpleCharacterImpl>(null);
  const directionalLight = useRef<DirectionalLight | null>(null);
  const { scene } = useThree();

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

    // Update player position and grid cell independently
    setPosition(character.position);
    setRotation(character.model?.scene.rotation || new Euler());

    // Determine current animation state based on active action
    setAction(character.actions);

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

      <Suspense>
        <SimpleCharacter ref={characterRef} />
      </Suspense>

      <Suspense>
        <InfiniteWorld />
      </Suspense>
    </>
  );
};
