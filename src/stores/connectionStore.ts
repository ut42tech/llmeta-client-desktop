import { create } from "zustand";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "failed"
  | "disconnected";

type ConnectionState = {
  status: ConnectionStatus;
  error?: string;
};

type ConnectionActions = {
  setConnecting: () => void;
  setConnected: () => void;
  setFailed: (error?: string) => void;
  setDisconnected: () => void;
  reset: () => void;
};

type ConnectionStore = ConnectionState & ConnectionActions;

const initialState: ConnectionState = {
  status: "idle",
  error: undefined,
};

export const useConnectionStore = create<ConnectionStore>((set) => ({
  ...initialState,
  setConnecting: () => set({ status: "connecting", error: undefined }),
  setConnected: () => set({ status: "connected", error: undefined }),
  setFailed: (error?: string) => set({ status: "failed", error }),
  setDisconnected: () => set({ status: "disconnected" }),
  reset: () => set(initialState),
}));
