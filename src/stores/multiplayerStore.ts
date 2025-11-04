import * as Colyseus from "colyseus.js";
import { create } from "zustand";
import {
  DEFAULT_SERVER_URL,
  MESSAGE_TYPES,
  ROOM_NAME,
} from "@/constants/multiplayer";
import type {
  ConnectionState,
  MyRoomState,
  PlayerState,
} from "@/types/colyseus";

type MultiplayerState = {
  client: Colyseus.Client | null;
  room: Colyseus.Room<MyRoomState> | null;
  connectionState: ConnectionState;
  error: string | null;
  serverUrl: string;
};

type MultiplayerActions = {
  connect: (username: string) => Promise<void>;
  disconnect: () => void;
  sendPosition: (x: number, y: number, z: number) => void;
  sendRotation: (x: number, y: number, z: number) => void;
  sendAnimation: (animation: string) => void;
  setServerUrl: (url: string) => void;
};

type MultiplayerStore = MultiplayerState & MultiplayerActions;

const initialState: MultiplayerState = {
  client: null,
  room: null,
  connectionState: "disconnected",
  error: null,
  serverUrl: DEFAULT_SERVER_URL,
};

/**
 * Setup room event handlers
 */
const setupRoomHandlers = (
  room: Colyseus.Room<MyRoomState>,
  set: (partial: Partial<MultiplayerState>) => void,
) => {
  // Handle player joined
  room.state.players?.onAdd?.((player: PlayerState, sessionId: string) => {
    console.log("Player joined:", sessionId, player.username);
  });

  // Handle player left
  room.state.players?.onRemove?.((_player: PlayerState, sessionId: string) => {
    console.log("Player left:", sessionId);
  });

  // Handle room errors
  room.onError((code, message) => {
    console.error("Room error:", code, message);
    set({ connectionState: "error", error: message });
  });

  // Handle room leave
  room.onLeave((code) => {
    console.log("Left room with code:", code);
    set({ connectionState: "disconnected", room: null });
  });
};

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  ...initialState,

  setServerUrl: (url: string) => {
    set({ serverUrl: url });
  },

  connect: async (username: string) => {
    const { client, connectionState, serverUrl } = get();

    if (connectionState === "connected" || connectionState === "connecting") {
      console.warn("Already connected or connecting");
      return;
    }

    try {
      set({ connectionState: "connecting", error: null });

      const colyseusClient = client || new Colyseus.Client(serverUrl);
      const room = await colyseusClient.joinOrCreate<MyRoomState>(ROOM_NAME, {
        username,
      });

      console.log("Connected to room:", room.roomId);

      setupRoomHandlers(room, set);

      set({
        client: colyseusClient,
        room,
        connectionState: "connected",
        error: null,
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      set({
        connectionState: "error",
        error: error instanceof Error ? error.message : "Connection failed",
      });
    }
  },

  disconnect: () => {
    const { room } = get();

    if (room) {
      room.leave();
    }

    set({
      room: null,
      connectionState: "disconnected",
      error: null,
    });
  },

  sendPosition: (x: number, y: number, z: number) => {
    const { room } = get();
    if (!room) return;

    room.send(MESSAGE_TYPES.POSITION, { x, y, z });
  },

  sendRotation: (x: number, y: number, z: number) => {
    const { room } = get();
    if (!room) return;

    room.send(MESSAGE_TYPES.ROTATION, { x, y, z });
  },

  sendAnimation: (animation: string) => {
    const { room } = get();
    if (!room) return;

    room.send(MESSAGE_TYPES.ANIMATION, { animation });
  },
}));
