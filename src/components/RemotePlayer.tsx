import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { RemotePlayer as RemotePlayerType } from "@/stores/remotePlayersStore";

type RemotePlayerProps = {
  player: RemotePlayerType;
};

const LERP_FACTOR = 0.1;

/**
 * Calculate shortest rotation difference considering wrapping
 */
const getShortestRotationDiff = (target: number, current: number): number => {
  const diff = target - current;
  return ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
};

/**
 * Remote player component with smooth interpolation
 */
export const RemotePlayer = ({ player }: RemotePlayerProps) => {
  const groupRef = useRef<Group>(null);
  const targetPosition = useRef(player.position.clone());
  const targetRotation = useRef(player.rotation.clone());

  // Update targets when player data changes
  targetPosition.current = player.position.clone();
  targetRotation.current = player.rotation.clone();

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    // Smooth position interpolation
    group.position.lerp(targetPosition.current, LERP_FACTOR);

    // Smooth rotation interpolation (Y-axis only)
    const shortestDiff = getShortestRotationDiff(
      targetRotation.current.y,
      group.rotation.y,
    );
    group.rotation.y += shortestDiff * LERP_FACTOR;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {player.username}
      </Text>
    </group>
  );
};
