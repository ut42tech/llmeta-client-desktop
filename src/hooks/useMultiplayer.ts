import { useEffect, useRef } from "react";
import type { AnimationName } from "@/stores/localPlayerStore";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useMultiplayerStore } from "@/stores/multiplayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import type { PlayerState } from "@/types/colyseus";

export const useMultiplayer = () => {
  const room = useMultiplayerStore((state) => state.room);
  const connectionState = useMultiplayerStore((state) => state.connectionState);

  const localPosition = useLocalPlayerStore((state) => state.position);
  const localRotation = useLocalPlayerStore((state) => state.rotation);
  const localAnimation = useLocalPlayerStore((state) => state.animationState);

  const sendPosition = useMultiplayerStore((state) => state.sendPosition);
  const sendRotation = useMultiplayerStore((state) => state.sendRotation);
  const sendAnimation = useMultiplayerStore((state) => state.sendAnimation);

  const addPlayer = useRemotePlayersStore((state) => state.addPlayer);
  const removePlayer = useRemotePlayersStore((state) => state.removePlayer);
  const updatePlayerPosition = useRemotePlayersStore(
    (state) => state.updatePlayerPosition,
  );
  const updatePlayerRotation = useRemotePlayersStore(
    (state) => state.updatePlayerRotation,
  );
  const updatePlayerAnimation = useRemotePlayersStore(
    (state) => state.updatePlayerAnimation,
  );
  const clearPlayers = useRemotePlayersStore((state) => state.clear);

  // Track previous values to avoid unnecessary sends
  const lastSentPosition = useRef({ x: 0, y: 0, z: 0 });
  const lastSentRotation = useRef({ x: 0, y: 0, z: 0 });
  const lastSentAnimation = useRef<AnimationName>("idle");

  // Send local player position to server
  useEffect(() => {
    if (connectionState !== "connected" || !room) return;

    const { x, y, z } = localPosition;
    const last = lastSentPosition.current;

    // Only send if position has changed
    if (x !== last.x || y !== last.y || z !== last.z) {
      sendPosition(x, y, z);
      lastSentPosition.current = { x, y, z };
    }
  }, [localPosition, connectionState, room, sendPosition]);

  // Send local player rotation to server
  useEffect(() => {
    if (connectionState !== "connected" || !room) return;

    const { x, y, z } = localRotation;
    const last = lastSentRotation.current;

    // Only send if rotation has changed
    if (x !== last.x || y !== last.y || z !== last.z) {
      sendRotation(x, y, z);
      lastSentRotation.current = { x, y, z };
    }
  }, [localRotation, connectionState, room, sendRotation]);

  // Send local player animation to server
  useEffect(() => {
    if (connectionState !== "connected" || !room) return;

    if (localAnimation !== lastSentAnimation.current) {
      sendAnimation(localAnimation);
      lastSentAnimation.current = localAnimation;
    }
  }, [localAnimation, connectionState, room, sendAnimation]);

  // Listen to room state changes
  useEffect(() => {
    if (!room) return;

    // Handle player additions
    const handlePlayerAdd = (player: PlayerState, sessionId: string) => {
      // Don't add ourselves
      if (sessionId === room.sessionId) return;

      addPlayer(sessionId, player.username || "Player");

      // Listen to player updates
      player.onChange?.(() => {
        if (player.position) {
          updatePlayerPosition(
            sessionId,
            player.position.x,
            player.position.y,
            player.position.z,
          );
        }
        if (player.rotation) {
          updatePlayerRotation(
            sessionId,
            player.rotation.x,
            player.rotation.y,
            player.rotation.z,
          );
        }
        if (player.animation) {
          updatePlayerAnimation(sessionId, player.animation as AnimationName);
        }
      });
    };

    // Handle player removals
    const handlePlayerRemove = (_player: PlayerState, sessionId: string) => {
      removePlayer(sessionId);
    };

    // Register listeners
    room.state.players?.onAdd?.(handlePlayerAdd);
    room.state.players?.onRemove?.(handlePlayerRemove);

    // Cleanup
    return () => {
      clearPlayers();
    };
  }, [
    room,
    addPlayer,
    removePlayer,
    updatePlayerPosition,
    updatePlayerRotation,
    updatePlayerAnimation,
    clearPlayers,
  ]);
};
