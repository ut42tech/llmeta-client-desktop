import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { RemotePlayerData } from "@/stores/remotePlayersStore";

type RemotePlayerProps = {
  player: RemotePlayerData;
};

/**
 * リモートプレイヤーコンポーネント
 * 他のプレイヤーをCubeとして表示
 */
export const RemotePlayer = ({ player }: RemotePlayerProps) => {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const lerpFactor = 1 - Math.exp(-2 * delta);

    groupRef.current.position.lerp(player.position, lerpFactor);
    groupRef.current.rotation.x +=
      (player.rotation.x - groupRef.current.rotation.x) * lerpFactor;
    groupRef.current.rotation.y +=
      (player.rotation.y - groupRef.current.rotation.y) * lerpFactor;
    groupRef.current.rotation.z +=
      (player.rotation.z - groupRef.current.rotation.z) * lerpFactor;
  });

  return (
    <group ref={groupRef} position={player.position} rotation={player.rotation}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#4080ff" />
      </mesh>
    </group>
  );
};
