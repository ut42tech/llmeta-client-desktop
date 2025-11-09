import { useEffect } from "react";
import { Euler, Vector3 } from "three";
import { RemoteSimpleCharacter } from "@/components/RemoteSimpleCharacter";
import type { AnimationName } from "@/stores/localPlayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import { type Player, useColyseusState } from "@/utils/colyseus";

/**
 * すべてのリモートプレイヤーを管理するコンポーネント
 * Colyseusルームの状態変更を監視し、プレイヤー情報を更新
 */
export const RemotePlayers = () => {
  const state = useColyseusState();
  const addOrUpdatePlayer = useRemotePlayersStore(
    (state) => state.addOrUpdatePlayer,
  );
  const removePlayer = useRemotePlayersStore((state) => state.removePlayer);
  const players = useRemotePlayersStore((state) => state.players);

  useEffect(() => {
    if (!state) return;

    // プレイヤーが追加されたとき
    const unsubscribeAdd = state.players.onAdd(
      (player: Player, key: string) => {
        // playerの存在とposition/rotationの存在をチェック
        if (!player || !player.position || !player.rotation) {
          console.warn(`[RemotePlayers] Invalid player data on add: ${key}`);
          return;
        }

        addOrUpdatePlayer(key, {
          sessionId: key,
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
      },
    );

    // プレイヤーが削除されたとき
    const unsubscribeRemove = state.players.onRemove(
      (_player: Player, key: string) => {
        removePlayer(key);
      },
    );

    // プレイヤー情報が変更されたとき
    const unsubscribeChange = state.players.onChange(
      (player: Player, key: string) => {
        // playerがnullの場合はスキップ（削除時など）
        if (!player || !player.position || !player.rotation) {
          return;
        }

        addOrUpdatePlayer(key, {
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
      },
    );

    return () => {
      unsubscribeAdd();
      unsubscribeRemove();
      unsubscribeChange();
    };
  }, [state, addOrUpdatePlayer, removePlayer]);

  return (
    <>
      {Array.from(players.values()).map((playerData) => (
        <RemoteSimpleCharacter key={playerData.sessionId} player={playerData} />
      ))}
    </>
  );
};
