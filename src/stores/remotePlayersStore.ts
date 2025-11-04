import { Euler, Vector3 } from "three";
import { create } from "zustand";
import type { AnimationName } from "@/stores/localPlayerStore";

export type RemotePlayer = {
  id: string;
  username: string;
  position: Vector3;
  rotation: Euler;
  animationState: AnimationName;
  lastUpdate: number;
};

type RemotePlayersState = {
  players: Map<string, RemotePlayer>;
  count: number;
};

type RemotePlayersActions = {
  addPlayer: (id: string, username: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerPosition: (id: string, x: number, y: number, z: number) => void;
  updatePlayerRotation: (id: string, x: number, y: number, z: number) => void;
  updatePlayerAnimation: (id: string, animation: AnimationName) => void;
  clear: () => void;
};

type RemotePlayersStore = RemotePlayersState & RemotePlayersActions;

export const useRemotePlayersStore = create<RemotePlayersStore>((set) => ({
  players: new Map(),
  count: 0,

  addPlayer: (id: string, username: string) => {
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.set(id, {
        id,
        username,
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        animationState: "idle",
        lastUpdate: Date.now(),
      });
      const newCount = newPlayers.size;
      return { players: newPlayers, count: newCount };
    });
  },

  removePlayer: (id: string) => {
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.delete(id);
      const newCount = newPlayers.size;
      return { players: newPlayers, count: newCount };
    });
  },

  updatePlayerPosition: (id: string, x: number, y: number, z: number) => {
    set((state) => {
      const player = state.players.get(id);
      if (!player) return state;

      const newPlayers = new Map(state.players);
      const updatedPlayer = {
        ...player,
        position: new Vector3(x, y, z),
        lastUpdate: Date.now(),
      };
      newPlayers.set(id, updatedPlayer);
      return { players: newPlayers };
    });
  },

  updatePlayerRotation: (id: string, x: number, y: number, z: number) => {
    set((state) => {
      const player = state.players.get(id);
      if (!player) return state;

      const newPlayers = new Map(state.players);
      const updatedPlayer = {
        ...player,
        rotation: new Euler(x, y, z),
        lastUpdate: Date.now(),
      };
      newPlayers.set(id, updatedPlayer);
      return { players: newPlayers };
    });
  },

  updatePlayerAnimation: (id: string, animation: AnimationName) => {
    set((state) => {
      const player = state.players.get(id);
      if (!player) return state;

      const newPlayers = new Map(state.players);
      const updatedPlayer = {
        ...player,
        animationState: animation,
        lastUpdate: Date.now(),
      };
      newPlayers.set(id, updatedPlayer);
      return { players: newPlayers };
    });
  },

  clear: () => {
    set({ players: new Map(), count: 0 });
  },
}));
