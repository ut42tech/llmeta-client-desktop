import { useEffect, useRef } from "react";
import type { Group } from "three";
import type { Player } from "@/utils/colyseus";

type RemotePlayerProps = {
  player: Player;
  playerId: string;
};

export const RemotePlayer = ({ player }: RemotePlayerProps) => {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (groupRef.current && player.position) {
      groupRef.current.position.set(
        player.position.x,
        player.position.y,
        player.position.z,
      );
    }
  }, [player.position]);

  useEffect(() => {
    if (groupRef.current && player.rotation) {
      groupRef.current.rotation.set(
        player.rotation.x,
        player.rotation.y,
        player.rotation.z,
      );
    }
  }, [player.rotation]);

  return (
    <group ref={groupRef}>
      {/* Simple cube to represent remote player */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* Username label above the player */}
      <mesh position={[0, 2.5, 0]}>
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
};
