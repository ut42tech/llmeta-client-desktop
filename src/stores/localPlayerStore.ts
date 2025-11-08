import { simpleCharacterAnimationNames } from "@pmndrs/viverse";
import type { Room } from "colyseus.js";
import { type AnimationAction, Euler, Vector3 } from "three";
import { create } from "zustand";
import { PERFORMANCE, PRECISION } from "@/constants";
import { MessageType, type MoveData, type MyRoomState } from "@/utils/colyseus";
import { roundToDecimals } from "@/utils/performance";

const INITIAL_PLAYER_POSITION = new Vector3(0, 0, 0);
const INITIAL_PLAYER_ROTATION = new Euler(0, 0, 0);

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

export type AnimationName = (typeof simpleCharacterAnimationNames)[number];

const PREFERRED_ANIMATION = "idle";

const FALLBACK_ANIMATION =
  simpleCharacterAnimationNames[0] ?? PREFERRED_ANIMATION;

const SELECTED_DEFAULT = simpleCharacterAnimationNames.includes(
  PREFERRED_ANIMATION,
)
  ? PREFERRED_ANIMATION
  : FALLBACK_ANIMATION;

export const DEFAULT_ANIMATION = SELECTED_DEFAULT as AnimationName;

type LocalPlayerState = {
  sessionId: string;
  // プレイヤー情報
  username: string;

  // 位置・回転
  position: Vector3;
  rotation: Euler;

  // 状態
  animationState: AnimationName;

  // 最後の送信時刻（スロットリング用）
  lastSentTime: number;
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
  animationState: DEFAULT_ANIMATION,
  lastSentTime: 0,
};

export const useLocalPlayerStore = create<LocalPlayerStore>((set, get) => ({
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
    roundedPosition.x = roundToDecimals(
      roundedPosition.x,
      PRECISION.DECIMAL_PLACES,
    );
    roundedPosition.y = roundToDecimals(
      roundedPosition.y,
      PRECISION.DECIMAL_PLACES,
    );
    roundedPosition.z = roundToDecimals(
      roundedPosition.z,
      PRECISION.DECIMAL_PLACES,
    );
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
    normalizedRotation.x = roundToDecimals(
      normalizedRotation.x,
      PRECISION.DECIMAL_PLACES,
    );
    normalizedRotation.y = roundToDecimals(
      normalizedRotation.y,
      PRECISION.DECIMAL_PLACES,
    );
    normalizedRotation.z = roundToDecimals(
      normalizedRotation.z,
      PRECISION.DECIMAL_PLACES,
    );
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
    set({ animationState: activeAnimationName ?? DEFAULT_ANIMATION });
  },

  sendMovement: (room: Room<MyRoomState>) => {
    const now = Date.now();
    const state = get();

    // スロットリング: 最小間隔を空ける
    if (now - state.lastSentTime < PERFORMANCE.MOVEMENT_UPDATE_THROTTLE) {
      return;
    }

    const moveData = createMoveData(
      state.position,
      state.rotation,
      state.animationState,
    );
    room.send(MessageType.MOVE, moveData);
    set({ lastSentTime: now });
  },

  reset: () => {
    set(initialState);
  },
}));
