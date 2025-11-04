/**
 * Multiplayer constants
 */

export const DEFAULT_SERVER_URL =
  process.env.NEXT_PUBLIC_COLYSEUS_SERVER_URL || "ws://localhost:2567";

export const ROOM_NAME = "my_room";

export const MESSAGE_TYPES = {
  POSITION: "position",
  ROTATION: "rotation",
  ANIMATION: "animation",
} as const;
