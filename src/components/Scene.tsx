import { Sky, SoftShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  SimpleCharacter,
  type SimpleCharacterImpl,
} from "@react-three/viverse";
import type { Room } from "colyseus.js";
import { useControls } from "leva";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { type DirectionalLight, Euler, Vector3 } from "three";
import { DebugPanel } from "@/components/DebugPanel";
import { InfiniteWorld } from "@/components/InfiniteWorld";
import { RemotePlayers } from "@/components/RemotePlayers";
import { LIGHTING, PHYSICS } from "@/constants";
import { useColyseusLifecycle } from "@/hooks/useColyseusLifecycle";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useWorldStore } from "@/stores/worldStore";
import { useColyseusRoom } from "@/utils/colyseus";

const LIGHT_OFFSET = new Vector3(
  LIGHTING.LIGHT_OFFSET.x,
  LIGHTING.LIGHT_OFFSET.y,
  LIGHTING.LIGHT_OFFSET.z,
);
const tmpVec = new Vector3();

/**
 * メインシーンコンポーネント
 * ローカルプレイヤー、リモートプレイヤー、ワールドを管理
 */
export const Scene = () => {
  // debug
  const { softShadows } = useControls({ softShadows: true });

  useColyseusLifecycle();

  const room = useColyseusRoom();
  const [isConnected, setIsConnected] = useState(false);

  const setSessionId = useLocalPlayerStore((state) => state.setSessionId);
  const setPosition = useLocalPlayerStore((state) => state.setPosition);
  const setRotation = useLocalPlayerStore((state) => state.setRotation);
  const setAction = useLocalPlayerStore((state) => state.setAction);
  const sendMovement = useLocalPlayerStore((state) => state.sendMovement);
  const updateCurrentGridCell = useWorldStore(
    (state) => state.updateCurrentGridCell,
  );

  const characterRef = useRef<SimpleCharacterImpl>(null);
  const directionalLight = useRef<DirectionalLight | null>(null);
  const { scene } = useThree();

  // セッション接続時の処理
  useEffect(() => {
    if (room?.sessionId) {
      setSessionId(room.sessionId);
      setIsConnected(true);
      console.log("[Scene] Colyseus connected, session ID:", room.sessionId);
    }
  }, [room?.sessionId, setSessionId]);

  // ライトターゲットの追加・削除
  useEffect(() => {
    const light = directionalLight.current;
    if (!light) {
      return;
    }

    scene.add(light.target);
    return () => {
      scene.remove(light.target);
    };
  }, [scene]);

  // メインループ（最適化済み）
  useFrame(() => {
    const character = characterRef.current;
    const light = directionalLight.current;

    if (!character || !light) {
      return;
    }

    // 落下時のリセット
    if (character.position.y < PHYSICS.RESET_Y_THRESHOLD) {
      character.position.copy(new Vector3());
    }

    // プレイヤー情報の更新
    setPosition(character.position);
    setRotation(character.model?.scene.rotation || new Euler());
    setAction(character.actions);

    // サーバーへの移動情報送信（スロットリング済み）
    if (isConnected && room) {
      sendMovement((room as unknown as Room) || undefined);
    }

    // グリッドセル更新
    updateCurrentGridCell(character.position);

    // ライト位置の更新（影がキャラクターに追従）
    light.target.position.copy(character.position);
    tmpVec.copy(light.target.position).add(LIGHT_OFFSET);
    light.position.copy(tmpVec);
  });

  // ライト設定
  const directionalLightIntensity = useMemo(
    () => LIGHTING.DIRECTIONAL_INTENSITY,
    [],
  );
  const ambientLightIntensity = useMemo(() => LIGHTING.AMBIENT_INTENSITY, []);

  return (
    <>
      <DebugPanel />

      {softShadows && <SoftShadows />}

      <Sky />
      <directionalLight
        intensity={directionalLightIntensity}
        position={[-10, 10, -10]}
        castShadow
        ref={directionalLight}
      />
      <ambientLight intensity={ambientLightIntensity} />

      {/* Local Player */}
      <Suspense fallback={null}>
        <SimpleCharacter ref={characterRef} />
      </Suspense>

      {/* Remote Players */}
      <Suspense fallback={null}>
        <RemotePlayers />
      </Suspense>

      <Suspense fallback={null}>
        <InfiniteWorld />
      </Suspense>
    </>
  );
};
