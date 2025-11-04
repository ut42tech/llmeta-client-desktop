import { useControls } from "leva";
import { useEffect } from "react";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useMultiplayerStore } from "@/stores/multiplayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";

/**
 * デバッグ用パネル - localPlayerStore、マルチプレイヤー状態を監視
 */
export const DebugPanel = () => {
  // Local Player State
  const position = useLocalPlayerStore((state) => state.position);
  const rotation = useLocalPlayerStore((state) => state.rotation);
  const id = useLocalPlayerStore((state) => state.id);
  const username = useLocalPlayerStore((state) => state.username);
  const animationState = useLocalPlayerStore((state) => state.animationState);

  // Multiplayer State
  const connectionState = useMultiplayerStore((state) => state.connectionState);
  const room = useMultiplayerStore((state) => state.room);
  const remotePlayers = useRemotePlayersStore((state) => state.players);

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
    Animation: {
      value: animationState,
      disabled: true,
    },
  }));

  const [, setMultiplayerControls] = useControls("Multiplayer", () => ({
    "Connection Status": {
      value: connectionState,
      disabled: true,
    },
    "Room ID": {
      value: room?.roomId || "Not connected",
      disabled: true,
    },
    "Session ID": {
      value: room?.sessionId || "Not connected",
      disabled: true,
    },
    "Remote Players": {
      value: remotePlayers.size,
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
      Animation: animationState,
    });
  }, [position, rotation, id, username, animationState, setPlayerControls]);

  useEffect(() => {
    setMultiplayerControls({
      "Connection Status": connectionState,
      "Room ID": room?.roomId || "Not connected",
      "Session ID": room?.sessionId || "Not connected",
      "Remote Players": remotePlayers.size,
    });
  }, [connectionState, room, remotePlayers, setMultiplayerControls]);

  return null; // UIは描画しない（Levaパネルのみ）
};
