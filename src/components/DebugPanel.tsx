import { useControls } from "leva";
import { useEffect } from "react";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";

/**
 * デバッグ用パネル - localPlayerStoreとその他の状態を監視
 */
export const DebugPanel = () => {
  // Local Player State
  const sessionId = useLocalPlayerStore((state) => state.sessionId);
  const position = useLocalPlayerStore((state) => state.position);
  const rotation = useLocalPlayerStore((state) => state.rotation);
  const username = useLocalPlayerStore((state) => state.username);
  const animationState = useLocalPlayerStore((state) => state.animationState);

  // Levaコントロールとset関数を取得
  const [, setPlayerControls] = useControls("Local Player", () => ({
    "Session ID": {
      value: sessionId,
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

  // 状態が変わったらLevaの値を更新
  useEffect(() => {
    setPlayerControls({
      "Session ID": sessionId,
      Username: username,
      "Position X": position.x,
      "Position Y": position.y,
      "Position Z": position.z,
      "Rotation X": rotation.x,
      "Rotation Y": rotation.y,
      "Rotation Z": rotation.z,
      Animation: animationState,
    });
  }, [
    sessionId,
    position,
    rotation,
    username,
    animationState,
    setPlayerControls,
  ]);

  return null; // UIは描画しない(Levaパネルのみ)
};
