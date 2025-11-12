"use client";

import { useEffect, useRef } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import {
  COLYSEUS_CONFIG,
  connectToColyseus,
  disconnectFromColyseus,
  useColyseusRoom,
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

  const room = useColyseusRoom();
  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
    if (room) {
      setConnected();
      console.log(`[Colyseus] Successfully connected to room: ${roomName}`);
    }
  }, [room, roomName, setConnected]);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    setConnecting();
    (async () => {
      try {
        await connectToColyseus(roomName);
        timer = setTimeout(() => {
          if (!mounted || roomRef.current) return;
          const message = "Failed to connect to Colyseus!";
          setFailed(message);
          console.error("[Colyseus] Connection failed:", message);
        }, 500);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (mounted) setFailed(message);
        console.error("[Colyseus] Connection failed:", message);
      }
    })();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      disconnectFromColyseus();
      setDisconnected();
      console.log("[Colyseus] Disconnected from room");
    };
  }, [roomName, setConnecting, setFailed, setDisconnected]);
}
