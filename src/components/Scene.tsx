import { Sky } from "@react-three/drei";
import {
  BvhPhysicsBody,
  PrototypeBox,
  SimpleCharacter,
} from "@react-three/viverse";

export function Scene() {
  return (
    <>
      <Sky />

      <directionalLight intensity={1.2} position={[5, 10, 10]} castShadow />
      <ambientLight intensity={1} />

      <SimpleCharacter />

      <BvhPhysicsBody>
        <PrototypeBox scale={[10, 0.5, 10]} position={[0, -2, 0]} />
      </BvhPhysicsBody>
    </>
  );
}
