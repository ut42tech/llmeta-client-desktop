import { useEffect } from "react";
import { Euler, Vector3 } from "three";
import { RemotePlayer } from "@/components/RemotePlayer";
import type { AnimationName } from "@/stores/localPlayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import {
  type Player,
  useColyseusRoom,
  useColyseusState,
} from "@/utils/colyseus";

/**
 * すべてのリモートプレイヤーを管理するコンポーネント
 */
export const RemotePlayers = () => {
  const room = useColyseusRoom();
  const state = useColyseusState();

  const players = useRemotePlayersStore((store) => store.players);
  const addOrUpdatePlayer = useRemotePlayersStore(
    (store) => store.addOrUpdatePlayer,
  );
  const removePlayer = useRemotePlayersStore((store) => store.removePlayer);
  const clearAll = useRemotePlayersStore((store) => store.clearAll);

  useEffect(() => {
    if (!room || !state) return;

    // 初期化：既存のプレイヤーをすべて追加（自分以外）
    state.players.forEach((player: Player, sessionId: string) => {
      if (sessionId === room.sessionId) return; // 自分は除外

      addOrUpdatePlayer(sessionId, {
        sessionId,
        username: player.username,
        position: new Vector3(
          player.position.x,
          player.position.y,
          player.position.z,
        ),
        rotation: new Euler(
          player.rotation.x,
          player.rotation.y,
          player.rotation.z,
        ),
        animation: player.animation as AnimationName,
      });
    });

    // プレイヤーが追加されたとき
    const onAdd = (player: Player, sessionId: string) => {
      if (sessionId === room.sessionId) return; // 自分は除外

      addOrUpdatePlayer(sessionId, {
        sessionId,
        username: player.username,
        position: new Vector3(
          player.position.x,
          player.position.y,
          player.position.z,
        ),
        rotation: new Euler(
          player.rotation.x,
          player.rotation.y,
          player.rotation.z,
        ),
        animation: player.animation as AnimationName,
      });

      // プレイヤーの状態変更を監視
      player.onChange(() => {
        addOrUpdatePlayer(sessionId, {
          username: player.username,
          position: new Vector3(
            player.position.x,
            player.position.y,
            player.position.z,
          ),
          rotation: new Euler(
            player.rotation.x,
            player.rotation.y,
            player.rotation.z,
          ),
          animation: player.animation as AnimationName,
        });
      });
    };

    // プレイヤーが削除されたとき
    const onRemove = (_player: Player, sessionId: string) => {
      removePlayer(sessionId);
    };

    // リスナー登録
    state.players.onAdd(onAdd);
    state.players.onRemove(onRemove);

    // クリーンアップ
    return () => {
      clearAll();
    };
  }, [room, state, addOrUpdatePlayer, removePlayer, clearAll]);

  // リモートプレイヤーをレンダリング
  return (
    <>
      {Array.from(players.values()).map((player) => (
        <RemotePlayer key={player.sessionId} player={player} />
      ))}
    </>
  );
};
