import { useControls } from "leva";
import { useEffect } from "react";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import { useRoomStore } from "@/stores/roomStore";

/**
 * デバッグ用パネル - localPlayerStoreとその他の状態を監視
 */
export const DebugPanel = () => {
  // Local Player State
  const position = useLocalPlayerStore((state) => state.position);
  const rotation = useLocalPlayerStore((state) => state.rotation);
  const id = useLocalPlayerStore((state) => state.id);
  const username = useLocalPlayerStore((state) => state.username);
  const isMoving = useLocalPlayerStore((state) => state.isMoving);
  const animationState = useLocalPlayerStore((state) => state.animationState);

  // Room State
  const isConnected = useRoomStore((state) => state.isConnected);
  const connectionState = useRoomStore((state) => state.connectionState);
  const roomId = useRoomStore((state) => state.roomId);
  const error = useRoomStore((state) => state.error);

  // Remote Players
  const remotePlayersCount = useRemotePlayersStore(
    (state) => state.players.size,
  );

  // Levaコントロールとset関数を取得
  const [, setPlayerControls] = useControls("Local Player", () => ({
    "Player ID": {
      value: id || "Not set",
      disabled: true,
    },
    Username: {
      value: username,
      disabled: true,
    },
    "Position X": {
      value: position.x,
      disabled: true,
    },
    "Position Y": {
      value: position.y,
      disabled: true,
    },
    "Position Z": {
      value: position.z,
      disabled: true,
    },
    "Rotation X": {
      value: rotation.x,
      disabled: true,
    },
    "Rotation Y": {
      value: rotation.y,
      disabled: true,
    },
    "Rotation Z": {
      value: rotation.z,
      disabled: true,
    },
    "Is Moving": {
      value: isMoving,
      disabled: true,
    },
    Animation: {
      value: animationState,
      disabled: true,
    },
  }));

  const [, setNetworkControls] = useControls("Network", () => ({
    Status: {
      value: connectionState,
      disabled: true,
    },
    Connected: {
      value: isConnected,
      disabled: true,
    },
    "Room ID": {
      value: roomId || "Not connected",
      disabled: true,
    },
    Error: {
      value: error || "None",
      disabled: true,
    },
    "Remote Players": {
      value: remotePlayersCount,
      disabled: true,
    },
  }));

  // 状態が変わったらLevaの値を更新
  useEffect(() => {
    setPlayerControls({
      "Player ID": id || "Not set",
      Username: username,
      "Position X": position.x,
      "Position Y": position.y,
      "Position Z": position.z,
      "Rotation X": rotation.x,
      "Rotation Y": rotation.y,
      "Rotation Z": rotation.z,
      "Is Moving": isMoving,
      Animation: animationState,
    });
  }, [
    position,
    rotation,
    id,
    username,
    isMoving,
    animationState,
    setPlayerControls,
  ]);

  useEffect(() => {
    setNetworkControls({
      Status: connectionState,
      Connected: isConnected,
      "Room ID": roomId || "Not connected",
      Error: error || "None",
      "Remote Players": remotePlayersCount,
    });
  }, [
    connectionState,
    isConnected,
    roomId,
    error,
    remotePlayersCount,
    setNetworkControls,
  ]);

  return null; // UIは描画しない（Levaパネルのみ）
};
