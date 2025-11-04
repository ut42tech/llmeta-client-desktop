/**
 * Colyseus State Schema types
 */

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  username: string;
  position: Position;
  rotation: Rotation;
  animation: string;
  onChange?: (callback: () => void) => void;
}

export interface MyRoomState {
  players: Map<string, PlayerState> & {
    onAdd?: (
      callback: (player: PlayerState, sessionId: string) => void,
    ) => void;
    onRemove?: (
      callback: (player: PlayerState, sessionId: string) => void,
    ) => void;
  };
}

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";
