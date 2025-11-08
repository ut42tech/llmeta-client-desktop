"use client";

import { useEffect } from "react";
import {
  COLYSEUS_CONFIG,
  connectToColyseus,
  disconnectFromColyseus,
} from "@/utils/colyseus";

/**
 * Colyseus接続ライフサイクル管理フック
 * コンポーネントのマウント時に接続、アンマウント時に切断を自動管理
 *
 * @param roomName - 接続するルーム名（デフォルト: "my_room"）
 */
export function useColyseusLifecycle(
  roomName: string = COLYSEUS_CONFIG.DEFAULT_ROOM_NAME,
) {
  useEffect(() => {
    let mounted = true;
    let connecting = false;

    const connect = async () => {
      // 二重接続を防ぐ
      if (connecting) return;
      connecting = true;

      try {
        await connectToColyseus(roomName);
        if (mounted) {
          console.log(`[Colyseus] Successfully connected to room: ${roomName}`);
        }
      } catch (error) {
        if (mounted) {
          console.error("[Colyseus] Connection failed:", error);
        }
      } finally {
        connecting = false;
      }
    };

    connect();

    return () => {
      mounted = false;
      disconnectFromColyseus();
      console.log("[Colyseus] Disconnected from room");
    };
  }, [roomName]);
}
