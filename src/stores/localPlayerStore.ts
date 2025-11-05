import type { Room } from "colyseus.js";
import { type AnimationAction, Euler, Vector3 } from "three";
import { create } from "zustand";
import { MessageType, type MoveData, type MyRoomState } from "@/utils/colyseus";

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

/**
 * Vector3をプレーンオブジェクトに変換
 */
function toPlainVec3(v: Vector3 | Euler): { x: number; y: number; z: number } {
  return { x: v.x, y: v.y, z: v.z };
}

/**
 * Vector3とEulerから移動データを構築（デスクトップ用）
 */
export function createMoveData(
  position: Vector3,
  rotation: Euler,
  animation: AnimationName,
): MoveData {
  return {
    position: toPlainVec3(position),
    rotation: { x: rotation.x, y: rotation.y, z: 0 },
    animation,
  };
}

export type AnimationName =
  | "walk"
  | "run"
  | "idle"
  | "jumpUp"
  | "jumpLoop"
  | "jumpDown"
  | "jumpForward";

type LocalPlayerState = {
  sessionId: string;
  // プレイヤー情報
  username: string;

  // 位置・回転
  position: Vector3;
  rotation: Euler;

  // 状態
  animationState: AnimationName;
};

type LocalPlayerActions = {
  setSessionId: (sessionId: string) => void;
  setUsername: (username: string) => void;
  setPosition: (position: Vector3) => void;
  setRotation: (rotation: Euler) => void;
  setAnimation: (state: AnimationName) => void;
  setAction: (actions?: Record<string, AnimationAction | undefined>) => void;
  sendMovement: (room: Room<MyRoomState>) => void;
  reset: () => void;
};

type LocalPlayerStore = LocalPlayerState & LocalPlayerActions;

const initialState: LocalPlayerState = {
  sessionId: "",
  username: "Player",
  position: INITIAL_PLAYER_POSITION.clone(),
  rotation: INITIAL_PLAYER_ROTATION.clone(),
  animationState: "idle",
};

export const useLocalPlayerStore = create<LocalPlayerStore>((set) => ({
  // State
  ...initialState,

  setSessionId: (sessionId: string) => {
    set({ sessionId });
  },

  setUsername: (username: string) => {
    set({ username });
  },

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

  sendMovement: (room: Room<MyRoomState>) => {
    const moveData = createMoveData(
      useLocalPlayerStore.getState().position,
      useLocalPlayerStore.getState().rotation,
      useLocalPlayerStore.getState().animationState,
    );
    room.send(MessageType.MOVE, moveData);
  },

  reset: () => {
    set(initialState);
  },
}));
