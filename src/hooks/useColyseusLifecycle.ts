"use client";

import { useEffect } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import {
  COLYSEUS_CONFIG,
  connectToColyseus,
  disconnectFromColyseus,
} from "@/utils/colyseus";

/**
 * Hook to manage the Colyseus connection lifecycle.
 * Automatically connects on mount and disconnects on unmount.
 *
 * @param roomName - Room name to connect to (default: "my_room")
 */
export function useColyseusLifecycle(
  roomName: string = COLYSEUS_CONFIG.DEFAULT_ROOM_NAME,
) {
  const setConnecting = useConnectionStore((state) => state.setConnecting);
  const setConnected = useConnectionStore((state) => state.setConnected);
  const setFailed = useConnectionStore((state) => state.setFailed);
  const setDisconnected = useConnectionStore((state) => state.setDisconnected);

  useEffect(() => {
    let mounted = true;
    let connecting = false;

    const connect = async () => {
      // Prevent duplicate connections
      if (connecting) return;
      connecting = true;

      try {
        setConnecting();
        await connectToColyseus(roomName);
        if (mounted) {
          setConnected();
          console.log(`[Colyseus] Successfully connected to room: ${roomName}`);
        }
      } catch (error) {
        if (mounted) {
          const message =
            error instanceof Error ? error.message : String(error);
          setFailed(message);
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
      setDisconnected();
      console.log("[Colyseus] Disconnected from room");
    };
  }, [roomName, setConnecting, setConnected, setFailed, setDisconnected]);
}
