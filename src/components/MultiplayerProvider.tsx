"use client";

import { useEffect } from "react";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import {
  COLYSEUS_CONFIG,
  connectToColyseus,
  disconnectFromColyseus,
  MessageType,
  type MoveData,
  useColyseusRoom,
} from "@/utils/colyseus";

/**
 * Multiplayer provider component that handles Colyseus connection
 * and synchronizes local player state with the server
 */
export const MultiplayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const room = useColyseusRoom();
  const setId = useLocalPlayerStore((state) => state.setId);
  const position = useLocalPlayerStore((state) => state.position);
  const rotation = useLocalPlayerStore((state) => state.rotation);
  const animationState = useLocalPlayerStore((state) => state.animationState);

  // Connect to Colyseus on mount
  useEffect(() => {
    const connect = async () => {
      try {
        await connectToColyseus(COLYSEUS_CONFIG.DEFAULT_ROOM_NAME);
      } catch (error) {
        console.error("Failed to connect to Colyseus:", error);
      }
    };

    connect();

    return () => {
      disconnectFromColyseus();
    };
  }, []);

  // Set local player ID when connected
  useEffect(() => {
    if (room?.sessionId) {
      setId(room.sessionId);
    }
  }, [room?.sessionId, setId]);

  // Synchronize local player position/rotation to server
  useEffect(() => {
    if (!room) return;

    const moveData: MoveData = {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
      animation: animationState,
    };

    room.send(MessageType.MOVE, moveData);
  }, [room, position, rotation, animationState]);

  return <>{children}</>;
};
