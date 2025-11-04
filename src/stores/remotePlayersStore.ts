import { create } from "zustand";
import type { Player } from "@/utils/colyseus";

type RemotePlayersState = {
  players: Map<string, Player>;
};

type RemotePlayersActions = {
  setPlayer: (id: string, player: Player) => void;
  removePlayer: (id: string) => void;
  clear: () => void;
};

type RemotePlayersStore = RemotePlayersState & RemotePlayersActions;

export const useRemotePlayersStore = create<RemotePlayersStore>((set) => ({
  // State
  players: new Map<string, Player>(),

  // Actions
  setPlayer: (id: string, player: Player) => {
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.set(id, player);
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

  clear: () => {
    set({ players: new Map() });
  },
}));
