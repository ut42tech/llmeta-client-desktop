"use client";

import { Text } from "@react-three/drei";
import { useColyseusRoom, useColyseusState } from "@/utils/colyseus";

/**
 * Component to render a single remote player as a cube
 */
const RemotePlayer = ({
  username,
  position,
}: {
  username: string;
  position: { x: number; y: number; z: number };
}) => {
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Render player as a cube */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#4080ff" />
      </mesh>
      {/* Display username above the cube */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {username}
      </Text>
    </group>
  );
};

/**
 * Component to render all remote players in the scene
 */
export const RemotePlayers = () => {
  const room = useColyseusRoom();
  const state = useColyseusState();

  if (!room || !state) {
    return null;
  }

  const remotePlayers = Array.from(state.players.entries()).filter(
    ([playerId]) => playerId !== room.sessionId,
  );

  return (
    <group>
      {remotePlayers.map(([playerId, player]) => (
        <RemotePlayer
          key={playerId}
          username={player.username}
          position={{
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
          }}
        />
      ))}
    </group>
  );
};
