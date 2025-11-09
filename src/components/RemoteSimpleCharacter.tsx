"use client";

import { useFrame } from "@react-three/fiber";
import {
  SimpleCharacter,
  type SimpleCharacterImpl,
} from "@react-three/viverse";
import { Suspense, useEffect, useRef, useState } from "react";
import { type AnimationAction, Euler, Quaternion } from "three";
import { PERFORMANCE } from "@/constants";
import { useRemoteCharacterAnimation } from "@/hooks/useRemoteCharacterAnimation";
import type { AnimationName } from "@/stores/localPlayerStore";
import type { RemotePlayerData } from "@/stores/remotePlayersStore";

export type RemoteSimpleCharacterProps = {
  player: RemotePlayerData;
};

const tmpQuatFrom = new Quaternion();
const tmpQuatTo = new Quaternion();
const tmpEuler = new Euler();

export const RemoteSimpleCharacter = ({
  player,
}: RemoteSimpleCharacterProps) => {
  const ref = useRef<SimpleCharacterImpl>(null);
  const [actionsMap, setActionsMap] = useState<
    Map<AnimationName, AnimationAction>
  >(new Map());

  const isModelLoaded = !!ref.current?.model?.scene;

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.position.copy(player.position);
    c.model?.scene.rotation.copy(player.rotation);
    if (c.actions) {
      const record = c.actions as Record<AnimationName, AnimationAction>;
      const map = new Map<AnimationName, AnimationAction>(
        Object.entries(record) as [AnimationName, AnimationAction][],
      );
      setActionsMap(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.sessionId]);

  useRemoteCharacterAnimation({
    animation: player.animation,
    mixer: ref.current?.mixer ?? null,
    actions: actionsMap,
    isModelLoaded,
  });

  useFrame(() => {
    const c = ref.current;
    if (!c) return;

    c.position.lerp(player.position, PERFORMANCE.POSITION_LERP_FACTOR);

    const modelScene = c.model?.scene;
    if (modelScene) {
      tmpQuatFrom.copy(modelScene.quaternion);
      tmpEuler.copy(player.rotation);
      tmpQuatTo.setFromEuler(tmpEuler);
      tmpQuatFrom.slerp(tmpQuatTo, PERFORMANCE.ROTATION_LERP_FACTOR);
      modelScene.quaternion.copy(tmpQuatFrom);
    }
  });

  return (
    <Suspense fallback={null}>
      <SimpleCharacter
        ref={ref}
        input={[]}
        cameraBehavior={false}
        model={{ castShadow: true, receiveShadow: true }}
      />
    </Suspense>
  );
};
