import { Sky } from "@react-three/drei";
import {
  BvhPhysicsBody,
  PrototypeBox,
  SimpleCharacter,
} from "@react-three/viverse";
import { Suspense } from "react";

export function Scene() {
  return (
    <>
      <Sky />

      <directionalLight intensity={1.2} position={[5, 10, 10]} castShadow />
      <ambientLight intensity={1} />

      <Suspense fallback={null}>
        <SimpleCharacter />
      </Suspense>

      <BvhPhysicsBody>
        <PrototypeBox scale={[10, 1, 10]} position={[0, -2, 0]} />
      </BvhPhysicsBody>
    </>
  );
}
