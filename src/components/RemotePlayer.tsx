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

  useFrame(() => {
    if (!groupRef.current) return;

    // スムーズに位置と回転を補間
    groupRef.current.position.lerp(player.position, 0.1);
    groupRef.current.rotation.x +=
      (player.rotation.x - groupRef.current.rotation.x) * 0.1;
    groupRef.current.rotation.y +=
      (player.rotation.y - groupRef.current.rotation.y) * 0.1;
    groupRef.current.rotation.z +=
      (player.rotation.z - groupRef.current.rotation.z) * 0.1;
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
