import { simpleCharacterAnimationNames } from "@pmndrs/viverse";
import type { Room } from "colyseus.js";
import { type AnimationAction, Euler, Vector3 } from "three";
import { create } from "zustand";
import { PERFORMANCE, PRECISION } from "@/constants";
import { MessageType, type MoveData, type MyRoomState } from "@/utils/colyseus";

const INITIAL_PLAYER_POSITION = new Vector3(0, 0, 0);
const INITIAL_PLAYER_ROTATION = new Euler(0, 0, 0);

/**
 * Convert a Vector3 to a plain object
 */
const toPlainVec3 = (
  v: Vector3 | Euler,
): { x: number; y: number; z: number } => {
  return { x: v.x, y: v.y, z: v.z };
};

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
 * Build movement data from Vector3 and Euler (desktop)
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
  // Player info
  username: string;

  // Position and rotation
  position: Vector3;
  rotation: Euler;

  // State
  animationState: AnimationName;

  // Teleport request handled by Scene (null = no pending teleport)
  pendingTeleport: { position: Vector3; rotation?: Euler } | null;

  // Last sent time (for throttling)
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
  teleport: (position: Vector3, rotation?: Euler) => void;
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
  pendingTeleport: null,
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

  teleport: (position: Vector3, rotation?: Euler) => {
    set({ pendingTeleport: { position, rotation } });
  },

  reset: () => {
    set(initialState);
  },
}));
