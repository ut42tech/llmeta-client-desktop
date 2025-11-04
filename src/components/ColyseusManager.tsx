"use client";

import { useEffect, useRef } from "react";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import {
  COLYSEUS_CONFIG,
  connectToColyseus,
  disconnectFromColyseus,
  MessageType,
  type MoveData,
  type Player,
  useColyseusRoom,
  useColyseusState,
} from "@/utils/colyseus";

/**
 * Manages Colyseus connection and synchronization between local/remote players
 */
export const ColyseusManager = () => {
  const room = useColyseusRoom();
  const state = useColyseusState();

  // Local player state
  const localPlayerId = useLocalPlayerStore((state) => state.id);
  const setLocalPlayerId = useLocalPlayerStore((state) => state.setId);
  const localPlayerPosition = useLocalPlayerStore((state) => state.position);
  const localPlayerRotation = useLocalPlayerStore((state) => state.rotation);

  // Remote players store
  const setPlayer = useRemotePlayersStore((state) => state.setPlayer);
  const removePlayer = useRemotePlayersStore((state) => state.removePlayer);
  const clearPlayers = useRemotePlayersStore((state) => state.clear);

  // Track last sent position to avoid sending duplicate updates
  const lastSentPosition = useRef({ x: 0, y: 0, z: 0 });
  const lastSentRotation = useRef({ x: 0, y: 0, z: 0 });

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
      clearPlayers();
    };
  }, [clearPlayers]);

  // Set local player ID when room is joined
  useEffect(() => {
    if (room?.sessionId && !localPlayerId) {
      setLocalPlayerId(room.sessionId);
    }
  }, [room, localPlayerId, setLocalPlayerId]);

  // Listen for player changes
  useEffect(() => {
    if (!state?.players || !room) return;

    // Handle player additions
    const onPlayerAdd = (player: Player, sessionId: string) => {
      // Don't add ourselves to the remote players
      if (sessionId !== room.sessionId) {
        setPlayer(sessionId, player);
      }
    };

    // Handle player changes
    const onPlayerChange = (player: Player, sessionId: string) => {
      // Don't track ourselves in remote players
      if (sessionId !== room.sessionId) {
        setPlayer(sessionId, player);
      }
    };

    // Handle player removals
    const onPlayerRemove = (_player: Player, sessionId: string) => {
      removePlayer(sessionId);
    };

    // Subscribe to all current players
    state.players.forEach((player, sessionId) => {
      if (sessionId !== room.sessionId) {
        setPlayer(sessionId, player);
      }
    });

    // Listen for player events
    state.players.onAdd(onPlayerAdd);
    state.players.onChange(onPlayerChange);
    state.players.onRemove(onPlayerRemove);

    return () => {
      state.players.onAdd(() => {});
      state.players.onChange(() => {});
      state.players.onRemove(() => {});
    };
  }, [state, room, setPlayer, removePlayer]);

  // Send position updates to server
  useEffect(() => {
    if (!room) return;

    // Check if position or rotation has changed significantly
    const posChanged =
      Math.abs(localPlayerPosition.x - lastSentPosition.current.x) > 0.01 ||
      Math.abs(localPlayerPosition.y - lastSentPosition.current.y) > 0.01 ||
      Math.abs(localPlayerPosition.z - lastSentPosition.current.z) > 0.01;

    const rotChanged =
      Math.abs(localPlayerRotation.y - lastSentRotation.current.y) > 0.01;

    if (posChanged || rotChanged) {
      const moveData: MoveData = {
        position: {
          x: localPlayerPosition.x,
          y: localPlayerPosition.y,
          z: localPlayerPosition.z,
        },
        rotation: {
          x: localPlayerRotation.x,
          y: localPlayerRotation.y,
          z: localPlayerRotation.z,
        },
      };

      room.send(MessageType.MOVE, moveData);

      // Update last sent values
      lastSentPosition.current = {
        x: localPlayerPosition.x,
        y: localPlayerPosition.y,
        z: localPlayerPosition.z,
      };
      lastSentRotation.current = {
        x: localPlayerRotation.x,
        y: localPlayerRotation.y,
        z: localPlayerRotation.z,
      };
    }
  }, [room, localPlayerPosition, localPlayerRotation]);

  return null; // This component doesn't render anything
};
