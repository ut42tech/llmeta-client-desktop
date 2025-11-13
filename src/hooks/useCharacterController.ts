import { useFrame } from "@react-three/fiber";
import type { SimpleCharacterImpl } from "@react-three/viverse";
import type { Room } from "colyseus.js";
import type { RefObject } from "react";
import { Euler, Vector3 } from "three";
import { PHYSICS } from "@/constants";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useWorldStore } from "@/stores/worldStore";
import type { MyRoomState } from "@/utils/colyseus";

/**
 * Character controller hook
 * Handles teleport, fall reset, state sync, and server updates
 */
export const useCharacterController = (
  characterRef: RefObject<SimpleCharacterImpl | null>,
  room: Room<MyRoomState> | undefined,
  isConnected: boolean,
) => {
  const pendingTeleport = useLocalPlayerStore((state) => state.pendingTeleport);
  const setPosition = useLocalPlayerStore((state) => state.setPosition);
  const setRotation = useLocalPlayerStore((state) => state.setRotation);
  const setAction = useLocalPlayerStore((state) => state.setAction);
  const sendMovement = useLocalPlayerStore((state) => state.sendMovement);
  const updateCurrentGridCell = useWorldStore(
    (state) => state.updateCurrentGridCell,
  );

  useFrame(() => {
    const character = characterRef.current;
    if (!character) return;

    // Apply pending teleport if present
    if (pendingTeleport) {
      character.position.copy(pendingTeleport.position);
      if (pendingTeleport.rotation) {
        character.model?.scene.rotation.copy(pendingTeleport.rotation);
      }
      useLocalPlayerStore.setState({ pendingTeleport: null });
    }

    // Reset on fall
    if (character.position.y < PHYSICS.RESET_Y_THRESHOLD) {
      character.position.copy(new Vector3());
    }

    // Update player state
    setPosition(character.position);
    setRotation(character.model?.scene.rotation || new Euler());
    setAction(character.actions);

    // Send movement to server
    if (isConnected && room) {
      sendMovement(room);
    }

    // Update grid cell
    updateCurrentGridCell(character.position);
  });
};
