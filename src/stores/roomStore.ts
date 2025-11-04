import type { Client, Room } from "colyseus.js";
import { create } from "zustand";

type RoomState = {
  // Colyseus接続
  client: Client | null;
  room: Room | null;

  // ルーム情報
  roomId: string | null;
  isConnected: boolean;
  connectionState: "disconnected" | "connecting" | "connected" | "error";

  // エラー情報
  error: string | null;
};

type RoomActions = {
  setClient: (client: Client) => void;
  setRoom: (room: Room | null) => void;
  setRoomId: (roomId: string | null) => void;
  setConnectionState: (state: RoomState["connectionState"]) => void;
  setError: (error: string | null) => void;
  disconnect: () => Promise<void>;
  reset: () => void;
};

type RoomStore = RoomState & RoomActions;

const initialState: RoomState = {
  client: null,
  room: null,
  roomId: null,
  isConnected: false,
  connectionState: "disconnected",
  error: null,
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  // State
  ...initialState,

  // Actions
  setClient: (client: Client) => {
    set({ client });
  },

  setRoom: (room: Room | null) => {
    set({
      room,
      isConnected: room !== null,
      connectionState: room ? "connected" : "disconnected",
      roomId: room ? ((room as Room & { id?: string }).id ?? null) : null,
    });
  },

  setRoomId: (roomId: string | null) => {
    set({ roomId });
  },

  setConnectionState: (connectionState: RoomState["connectionState"]) => {
    set({
      connectionState,
      isConnected: connectionState === "connected",
    });
  },

  setError: (error: string | null) => {
    set({ error });
    if (error) {
      set({ connectionState: "error" });
    }
  },

  disconnect: async () => {
    const { room } = get();
    if (room) {
      try {
        await room.leave();
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }
    set({
      room: null,
      isConnected: false,
      connectionState: "disconnected",
      roomId: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
