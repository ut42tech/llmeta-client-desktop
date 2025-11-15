"use client";

import { useEffect } from "react";
import { Euler, Vector3 } from "three";
import type { AnimationName } from "@/stores/localPlayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import { type Player, useColyseusState } from "@/utils/colyseus";

/**
 * Hook that syncs Colyseus room state with the Zustand store.
 * Subscribes to add/remove/change events to keep the local cache of remote players up to date.
 */
export function useRemotePlayersSync() {
  const state = useColyseusState();
  const addOrUpdatePlayer = useRemotePlayersStore((s) => s.addOrUpdatePlayer);
  const removePlayer = useRemotePlayersStore((s) => s.removePlayer);

  useEffect(() => {
    if (!state) return;

    const onAdd = (player: Player, key: string) => {
      if (!player || !player.position || !player.rotation) return;
      addOrUpdatePlayer(key, {
        sessionId: key,
        username: player.username,
        avatar: player.avatar,
        position: new Vector3(
          player.position.x,
          player.position.y,
          player.position.z,
        ),
        rotation: new Euler(
          player.rotation.x,
          player.rotation.y,
          player.rotation.z,
        ),
        animation: player.animation as AnimationName,
      });
    };

    const onRemove = (_player: Player, key: string) => {
      removePlayer(key);
    };

    const onChange = (player: Player, key: string) => {
      if (!player || !player.position || !player.rotation) return;
      addOrUpdatePlayer(key, {
        avatar: player.avatar,
        position: new Vector3(
          player.position.x,
          player.position.y,
          player.position.z,
        ),
        rotation: new Euler(
          player.rotation.x,
          player.rotation.y,
          player.rotation.z,
        ),
        animation: player.animation as AnimationName,
      });
    };

    const unsubAdd = state.players.onAdd(onAdd);
    const unsubRemove = state.players.onRemove(onRemove);
    const unsubChange = state.players.onChange(onChange);

    return () => {
      unsubAdd();
      unsubRemove();
      unsubChange();
    };
  }, [state, addOrUpdatePlayer, removePlayer]);
}
