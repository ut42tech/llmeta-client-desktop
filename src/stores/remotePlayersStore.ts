import type { Euler, Vector3 } from "three";
import { create } from "zustand";

export type RemotePlayer = {
  id: string;
  position: Vector3;
  rotation: Euler;
  username: string;
  isMoving: boolean;
  animationState: string;
  lastUpdate: number;
};

type RemotePlayersState = {
  players: Map<string, RemotePlayer>;
};

type RemotePlayersActions = {
  addPlayer: (id: string, data: Omit<RemotePlayer, "id">) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, data: Partial<Omit<RemotePlayer, "id">>) => void;
  updatePlayerPosition: (id: string, position: Vector3) => void;
  updatePlayerRotation: (id: string, rotation: Euler) => void;
  clearAll: () => void;
  getPlayer: (id: string) => RemotePlayer | undefined;
  getAllPlayers: () => RemotePlayer[];
};

type RemotePlayersStore = RemotePlayersState & RemotePlayersActions;

export const useRemotePlayersStore = create<RemotePlayersStore>((set, get) => ({
  // State
  players: new Map<string, RemotePlayer>(),

  // Actions
  addPlayer: (id: string, data: Omit<RemotePlayer, "id">) => {
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.set(id, {
        id,
        ...data,
        position: data.position.clone(),
        rotation: data.rotation.clone(),
        lastUpdate: Date.now(),
      });
      return { players: newPlayers };
    });
  },

  removePlayer: (id: string) => {
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.delete(id);
      return { players: newPlayers };
    });
  },

  updatePlayer: (id: string, data: Partial<Omit<RemotePlayer, "id">>) => {
    set((state) => {
      const player = state.players.get(id);
      if (!player) return state;

      const newPlayers = new Map(state.players);
      newPlayers.set(id, {
        ...player,
        ...data,
        position: data.position ? data.position.clone() : player.position,
        rotation: data.rotation ? data.rotation.clone() : player.rotation,
        lastUpdate: Date.now(),
      });
      return { players: newPlayers };
    });
  },

  updatePlayerPosition: (id: string, position: Vector3) => {
    set((state) => {
      const player = state.players.get(id);
      if (!player) return state;

      const newPlayers = new Map(state.players);
      newPlayers.set(id, {
        ...player,
        position: position.clone(),
        lastUpdate: Date.now(),
      });
      return { players: newPlayers };
    });
  },

  updatePlayerRotation: (id: string, rotation: Euler) => {
    set((state) => {
      const player = state.players.get(id);
      if (!player) return state;

      const newPlayers = new Map(state.players);
      newPlayers.set(id, {
        ...player,
        rotation: rotation.clone(),
        lastUpdate: Date.now(),
      });
      return { players: newPlayers };
    });
  },

  clearAll: () => {
    set({ players: new Map() });
  },

  getPlayer: (id: string) => {
    return get().players.get(id);
  },

  getAllPlayers: () => {
    return Array.from(get().players.values());
  },
}));
