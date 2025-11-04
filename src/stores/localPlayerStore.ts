import { Euler, Vector3 } from "three";
import { create } from "zustand";

const INITIAL_PLAYER_POSITION = new Vector3(0, 0, 0);
const INITIAL_PLAYER_ROTATION = new Euler(0, 0, 0);

type LocalPlayerState = {
  // 位置・回転
  position: Vector3;
  rotation: Euler;

  // プレイヤー情報
  id: string | null;
  username: string;

  // 状態
  isMoving: boolean;
  animationState: string;

  // ネットワーク同期用
  lastSyncTime: number;
};

type LocalPlayerActions = {
  setPosition: (position: Vector3) => void;
  setRotation: (rotation: Euler) => void;
  setId: (id: string) => void;
  setUsername: (username: string) => void;
  setMoving: (isMoving: boolean) => void;
  setAnimationState: (state: string) => void;
  updateLastSyncTime: () => void;
  reset: () => void;
};

type LocalPlayerStore = LocalPlayerState & LocalPlayerActions;

const initialState: LocalPlayerState = {
  position: INITIAL_PLAYER_POSITION.clone(),
  rotation: INITIAL_PLAYER_ROTATION.clone(),
  id: null,
  username: "Player",
  isMoving: false,
  animationState: "idle",
  lastSyncTime: 0,
};

export const useLocalPlayerStore = create<LocalPlayerStore>((set) => ({
  // State
  ...initialState,

  // Actions
  setPosition: (position: Vector3) => {
    set({ position: position.clone() });
  },

  setRotation: (rotation: Euler) => {
    set({ rotation: rotation.clone() });
  },

  setId: (id: string) => {
    set({ id });
  },

  setUsername: (username: string) => {
    set({ username });
  },

  setMoving: (isMoving: boolean) => {
    set({ isMoving });
  },

  setAnimationState: (animationState: string) => {
    set({ animationState });
  },

  updateLastSyncTime: () => {
    set({ lastSyncTime: Date.now() });
  },

  reset: () => {
    set(initialState);
  },
}));
