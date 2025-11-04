import { useEffect, useRef } from "react";
import type { AnimationName } from "@/stores/localPlayerStore";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useMultiplayerStore } from "@/stores/multiplayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import type { PlayerState, Position, Rotation } from "@/types/colyseus";

/**
 * Check if position has changed
 */
const hasPositionChanged = (current: Position, previous: Position): boolean => {
  return (
    current.x !== previous.x ||
    current.y !== previous.y ||
    current.z !== previous.z
  );
};

/**
 * Check if rotation has changed
 */
const hasRotationChanged = (current: Rotation, previous: Rotation): boolean => {
  return (
    current.x !== previous.x ||
    current.y !== previous.y ||
    current.z !== previous.z
  );
};

/**
 * Hook to manage multiplayer synchronization
 */
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

  const lastSentPosition = useRef<Position>({ x: 0, y: 0, z: 0 });
  const lastSentRotation = useRef<Rotation>({ x: 0, y: 0, z: 0 });
  const lastSentAnimation = useRef<AnimationName>("idle");

  // Sync local player position
  useEffect(() => {
    if (connectionState !== "connected" || !room) return;

    const currentPosition = {
      x: localPosition.x,
      y: localPosition.y,
      z: localPosition.z,
    };

    if (hasPositionChanged(currentPosition, lastSentPosition.current)) {
      sendPosition(currentPosition.x, currentPosition.y, currentPosition.z);
      lastSentPosition.current = currentPosition;
    }
  }, [localPosition, connectionState, room, sendPosition]);

  // Sync local player rotation
  useEffect(() => {
    if (connectionState !== "connected" || !room) return;

    const currentRotation = {
      x: localRotation.x,
      y: localRotation.y,
      z: localRotation.z,
    };

    if (hasRotationChanged(currentRotation, lastSentRotation.current)) {
      sendRotation(currentRotation.x, currentRotation.y, currentRotation.z);
      lastSentRotation.current = currentRotation;
    }
  }, [localRotation, connectionState, room, sendRotation]);

  // Sync local player animation
  useEffect(() => {
    if (connectionState !== "connected" || !room) return;

    if (localAnimation !== lastSentAnimation.current) {
      sendAnimation(localAnimation);
      lastSentAnimation.current = localAnimation;
    }
  }, [localAnimation, connectionState, room, sendAnimation]);

  // Setup remote players synchronization
  useEffect(() => {
    if (!room) return;

    const handlePlayerAdd = (player: PlayerState, sessionId: string) => {
      if (sessionId === room.sessionId) return;

      addPlayer(sessionId, player.username || "Player");

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

    const handlePlayerRemove = (_player: PlayerState, sessionId: string) => {
      removePlayer(sessionId);
    };

    room.state.players?.onAdd?.(handlePlayerAdd);
    room.state.players?.onRemove?.(handlePlayerRemove);

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
