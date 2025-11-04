// Colyseus State Schema types
export interface PlayerState {
  username: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
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
