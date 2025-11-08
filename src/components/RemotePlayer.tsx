import { useFrame } from "@react-three/fiber";
import { memo, useRef } from "react";
import type { Group } from "three";
import { PERFORMANCE } from "@/constants";
import { useRemoteCharacter } from "@/hooks/useRemoteCharacter";
import { useRemoteCharacterAnimation } from "@/hooks/useRemoteCharacterAnimation";
import type { RemotePlayerData } from "@/stores/remotePlayersStore";

type RemotePlayerProps = {
  player: RemotePlayerData;
};

/**
 * リモートプレイヤーコンポーネント
 * 位置と回転を滑らかに補間し、アニメーションを再生する
 */
const RemotePlayerComponent = ({ player }: RemotePlayerProps) => {
  const groupRef = useRef<Group>(null);
  const { mixer, actions, isLoaded } = useRemoteCharacter(groupRef);

  useRemoteCharacterAnimation(player.animation, mixer, actions, isLoaded);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || !isLoaded) return;

    group.position.lerp(player.position, PERFORMANCE.POSITION_LERP_FACTOR);

    group.rotation.y =
      Math.atan2(
        Math.sin(player.rotation.y - group.rotation.y),
        Math.cos(player.rotation.y - group.rotation.y),
      ) *
        PERFORMANCE.ROTATION_LERP_FACTOR +
      group.rotation.y;

    mixer?.update(delta);
  });

  return <group ref={groupRef} />;
};

// プレイヤーデータの変更時のみ再レンダリング
export const RemotePlayer = memo(RemotePlayerComponent, (prev, next) => {
  return (
    prev.player.sessionId === next.player.sessionId &&
    prev.player.animation === next.player.animation &&
    prev.player.position.equals(next.player.position) &&
    prev.player.rotation.y === next.player.rotation.y
  );
});
