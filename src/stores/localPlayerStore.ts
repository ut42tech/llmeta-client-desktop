import { type AnimationAction, Euler, Vector3 } from "three";
import { create } from "zustand";

const INITIAL_PLAYER_POSITION = new Vector3(0, 0, 0);
const INITIAL_PLAYER_ROTATION = new Euler(0, 0, 0);

/**
 * Round a number to the specified decimal places
 * @param value - The number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 */
const roundToDecimals = (value: number, decimals = 2): number => {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
};

export type AnimationName =
  | "walk"
  | "run"
  | "idle"
  | "jumpUp"
  | "jumpLoop"
  | "jumpDown"
  | "jumpForward";

type LocalPlayerState = {
  // 位置・回転
  position: Vector3;
  rotation: Euler;

  // プレイヤー情報
  id: string | null;
  username: string;

  // 状態
  animationState: AnimationName;
};

type LocalPlayerActions = {
  setPosition: (position: Vector3) => void;
  setRotation: (rotation: Euler) => void;
  setId: (id: string) => void;
  setUsername: (username: string) => void;
  setAnimation: (state: AnimationName) => void;
  setAction: (actions?: Record<string, AnimationAction | undefined>) => void;
  reset: () => void;
};

type LocalPlayerStore = LocalPlayerState & LocalPlayerActions;

const initialState: LocalPlayerState = {
  position: INITIAL_PLAYER_POSITION.clone(),
  rotation: INITIAL_PLAYER_ROTATION.clone(),
  id: null,
  username: "Player",
  animationState: "idle",
};

export const useLocalPlayerStore = create<LocalPlayerStore>((set) => ({
  // State
  ...initialState,

  // Actions
  setPosition: (position: Vector3) => {
    const roundedPosition = position.clone();
    roundedPosition.x = roundToDecimals(roundedPosition.x);
    roundedPosition.y = roundToDecimals(roundedPosition.y);
    roundedPosition.z = roundToDecimals(roundedPosition.z);
    set({ position: roundedPosition });
  },

  setRotation: (rotation: Euler) => {
    const normalizedRotation = rotation.clone();
    // Normalize rotation values to [-π, π] range
    normalizedRotation.x =
      ((normalizedRotation.x + Math.PI) % (2 * Math.PI)) - Math.PI;
    normalizedRotation.y =
      ((normalizedRotation.y + Math.PI) % (2 * Math.PI)) - Math.PI;
    normalizedRotation.z =
      ((normalizedRotation.z + Math.PI) % (2 * Math.PI)) - Math.PI;
    // Round rotation values to 2 decimal places
    normalizedRotation.x = roundToDecimals(normalizedRotation.x);
    normalizedRotation.y = roundToDecimals(normalizedRotation.y);
    normalizedRotation.z = roundToDecimals(normalizedRotation.z);
    set({ rotation: normalizedRotation });
  },

  setId: (id: string) => {
    set({ id });
  },

  setUsername: (username: string) => {
    set({ username });
  },

  setAnimation: (animationState: AnimationName) => {
    set({ animationState });
  },

  setAction: (actions) => {
    const activeAnimationName = actions
      ? (Object.entries(actions).find(
          ([, action]) =>
            action?.isRunning() && (action.getEffectiveWeight?.() ?? 0) > 0,
        )?.[0] as AnimationName | undefined)
      : undefined;
    set({ animationState: activeAnimationName ?? "idle" });
  },

  reset: () => {
    set(initialState);
  },
}));
