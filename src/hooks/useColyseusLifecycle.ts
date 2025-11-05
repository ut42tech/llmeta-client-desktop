"use client";

import { useEffect } from "react";
import {
  COLYSEUS_CONFIG,
  connectToColyseus,
  disconnectFromColyseus,
} from "@/utils/colyseus";

/**
 * Colyseus接続ライフサイクル管理フック
 *
 * @param roomName - 接続するルーム名（デフォルト: "my_room"）
 */
export function useColyseusLifecycle(
  roomName: string = COLYSEUS_CONFIG.DEFAULT_ROOM_NAME,
) {
  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        await connectToColyseus(roomName);
        if (mounted) {
          console.log(`[Colyseus] Connected to room: ${roomName}`);
        }
      } catch (error) {
        if (mounted) {
          console.error("[Colyseus] Failed to connect:", error);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      disconnectFromColyseus();
      console.log("[Colyseus] Disconnected");
    };
  }, [roomName]);
}
