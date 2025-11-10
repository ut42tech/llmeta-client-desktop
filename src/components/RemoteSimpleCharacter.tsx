"use client";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  type AnimationAction,
  AnimationMixer,
  Euler,
  type Group,
  Quaternion,
} from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {
  idleUrl,
  jumpDownUrl,
  jumpForwardUrl,
  jumpLoopUrl,
  jumpUpUrl,
  mannequinUrl,
  PERFORMANCE,
  runUrl,
  walkUrl,
} from "@/constants";
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
  type GLTFLoaderWithMeshopt = GLTFLoader & {
    setMeshoptDecoder: (decoder: unknown) => void;
  };
  const group = useRef<Group>(null);
  const [model, setModel] = useState<Group | null>(null);
  const [mixer, setMixer] = useState<AnimationMixer | null>(null);
  const [actions, setActions] = useState<Map<AnimationName, AnimationAction>>(
    () => new Map(),
  );
  const currentActionRef = useRef<AnimationAction | null>(null);

  // GLTFLoader（meshopt 対応）
  const gltfLoader = useMemo(() => {
    const loader = new GLTFLoader() as GLTFLoaderWithMeshopt;
    loader.setMeshoptDecoder(MeshoptDecoder as unknown);
    return loader;
  }, []);

  // モデルの読み込み
  useEffect(() => {
    let disposed = false;
    (async () => {
      const { scene } = await gltfLoader.loadAsync(mannequinUrl);
      if (disposed) return;
      scene.traverse((o) => {
        o.frustumCulled = false;
        o.castShadow = true;
        o.receiveShadow = true;
      });
      setModel(scene);
      setMixer(new AnimationMixer(scene));
    })();
    return () => {
      disposed = true;
    };
  }, [gltfLoader]);

  // アニメーションの読み込み
  useEffect(() => {
    if (!model || !mixer) return;
    let cancelled = false;
    (async () => {
      const entries: Array<[AnimationName, string]> = [
        ["idle", idleUrl],
        ["walk", walkUrl],
        ["run", runUrl],
        ["jumpUp", jumpUpUrl],
        ["jumpLoop", jumpLoopUrl],
        ["jumpDown", jumpDownUrl],
        ["jumpForward", jumpForwardUrl],
      ];

      const actionsMap = new Map<AnimationName, AnimationAction>();
      for (const [name, url] of entries) {
        const { animations } = await gltfLoader.loadAsync(url);
        if (!animations?.length) continue;
        const action = mixer.clipAction(animations[0], model);
        actionsMap.set(name, action);
      }
      if (cancelled) return;
      setActions(actionsMap);
    })();
    return () => {
      cancelled = true;
    };
  }, [model, mixer, gltfLoader]);

  // ネットワークのアニメーション名を即時反映
  useEffect(() => {
    if (!mixer || actions.size === 0) return;
    const next = actions.get(player.animation);
    if (!next) return;
    // ブレンドの残留を避ける
    mixer.stopAllAction();
    const current = currentActionRef.current;
    if (current && current !== next) current.stop();
    next.reset().play();
    currentActionRef.current = next;
  }, [player.animation, actions, mixer]);

  // 位置/回転 & mixer の更新
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // 位置補間
    g.position.lerp(player.position, PERFORMANCE.POSITION_LERP_FACTOR);
    if (model) {
      tmpQuatFrom.copy(model.quaternion);
      tmpEuler.set(
        player.rotation.x,
        player.rotation.y + Math.PI,
        player.rotation.z,
      );
      tmpQuatTo.setFromEuler(tmpEuler);
      tmpQuatFrom.slerp(tmpQuatTo, PERFORMANCE.ROTATION_LERP_FACTOR);
      model.quaternion.copy(tmpQuatFrom);
    }
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
