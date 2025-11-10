"use client";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import type { Group } from "three";
import { useGltfCharacterAssets } from "@/hooks/useGltfCharacterAssets";
import { useRemoteCharacterAnimation } from "@/hooks/useRemoteCharacterAnimation";
import {
  usePositionBuffer,
  useRotationBuffer,
} from "@/hooks/useSnapshotBuffer";
import type { RemotePlayerData } from "@/stores/remotePlayersStore";

export type RemoteSimpleCharacterProps = {
  player: RemotePlayerData;
};

// smoothing handled via hooks

export const RemoteSimpleCharacter = ({
  player,
}: RemoteSimpleCharacterProps) => {
  const group = useRef<Group>(null);

  const { model, mixer, actions, isLoaded } = useGltfCharacterAssets();

  // アニメーションブレンド（フェード）
  useRemoteCharacterAnimation({
    animation: player.animation,
    mixer,
    actions,
    isModelLoaded: isLoaded,
  });

  // 位置・回転の補間（スナップショット補完）
  const smoothPosition = usePositionBuffer(player.position);
  const smoothRotationQuat = useRotationBuffer(player.rotation);

  // 位置/回転 & mixer の更新
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // バッファ済みのスムーズな位置/回転を適用
    g.position.copy(smoothPosition);
    if (model) model.quaternion.copy(smoothRotationQuat);
    // アニメーション時間更新
    mixer?.update(delta);
  });

  // 初期スナップ
  useEffect(() => {
    const g = group.current;
    if (!g || !model) return;
    g.position.copy(player.position);
    model.rotation.set(
      player.rotation.x,
      player.rotation.y + Math.PI,
      player.rotation.z,
    );
  }, [
    model,
    player.position,
    player.rotation.x,
    player.rotation.y,
    player.rotation.z,
  ]);

  return (
    <Suspense fallback={null}>
      <group ref={group}>{model && <primitive object={model} />}</group>
    </Suspense>
  );
};
