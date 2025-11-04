import type { Room } from "colyseus.js";
import { Client } from "colyseus.js";
import { Euler, Vector3 } from "three";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";
import { useRoomStore } from "@/stores/roomStore";

// Colyseusサーバーのエンドポイント（環境変数から取得）
const COLYSEUS_ENDPOINT =
  process.env.NEXT_PUBLIC_COLYSEUS_ENDPOINT || "ws://localhost:2567";

// プレイヤーデータの型定義（Colyseusスキーマと一致させる）
export type PlayerData = {
  id: string;
  username: string;
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  isMoving: boolean;
  animationState: string;
};

// ルームオプションの型
export type RoomOptions = Record<string, unknown>;

/**
 * Colyseusクライアントを初期化
 */
export function initializeColyseusClient(): Client {
  const client = new Client(COLYSEUS_ENDPOINT);
  useRoomStore.getState().setClient(client);
  return client;
}

/**
 * ルームに参加または作成
 */
export async function joinOrCreateRoom(
  client: Client,
  roomName: string,
  options: RoomOptions = {},
): Promise<Room> {
  try {
    useRoomStore.getState().setConnectionState("connecting");

    const room = await client.joinOrCreate(roomName, options);

    useRoomStore.getState().setRoom(room);
    setupRoomListeners(room);

    console.log("Joined room:", room.roomId);
    return room;
  } catch (error) {
    console.error("Failed to join room:", error);
    useRoomStore
      .getState()
      .setError(error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
}

/**
 * ルームのイベントリスナーをセットアップ
 */
function setupRoomListeners(room: Room) {
  // プレイヤーが追加された時
  room.state.players?.onAdd((player: PlayerData, sessionId: string) => {
    console.log("Player joined:", sessionId, player);

    // 自分自身の場合
    if (sessionId === room.sessionId) {
      useLocalPlayerStore.getState().setId(sessionId);
      useLocalPlayerStore.getState().setUsername(player.username);
      return;
    }

    // 他のプレイヤーの場合
    useRemotePlayersStore.getState().addPlayer(sessionId, {
      position: new Vector3(player.x, player.y, player.z),
      rotation: new Euler(player.rotationX, player.rotationY, player.rotationZ),
      username: player.username,
      isMoving: player.isMoving,
      animationState: player.animationState,
      lastUpdate: Date.now(),
    });
  });

  // プレイヤーが変更された時
  room.state.players?.onChange((player: PlayerData, sessionId: string) => {
    // 自分自身は無視（ローカルで既に更新済み）
    if (sessionId === room.sessionId) {
      return;
    }

    // 他のプレイヤーの更新
    useRemotePlayersStore.getState().updatePlayer(sessionId, {
      position: new Vector3(player.x, player.y, player.z),
      rotation: new Euler(player.rotationX, player.rotationY, player.rotationZ),
      isMoving: player.isMoving,
      animationState: player.animationState,
    });
  });

  // プレイヤーが削除された時
  room.state.players?.onRemove((_player: PlayerData, sessionId: string) => {
    console.log("Player left:", sessionId);
    useRemotePlayersStore.getState().removePlayer(sessionId);
  });

  // エラー処理
  room.onError((code: number, message?: string) => {
    console.error("Room error:", code, message);
    useRoomStore.getState().setError(`Error ${code}: ${message}`);
  });

  // ルームから退出した時
  room.onLeave((code: number) => {
    console.log("Left room with code:", code);
    useRoomStore.getState().setConnectionState("disconnected");
    useRemotePlayersStore.getState().clearAll();
  });
}

/**
 * ローカルプレイヤーの位置を送信
 */
export function sendPlayerPosition(room: Room, position: Vector3) {
  room.send("updatePosition", {
    x: position.x,
    y: position.y,
    z: position.z,
  });
}

/**
 * ローカルプレイヤーの回転を送信
 */
export function sendPlayerRotation(room: Room, rotation: Euler) {
  room.send("updateRotation", {
    x: rotation.x,
    y: rotation.y,
    z: rotation.z,
  });
}

/**
 * ローカルプレイヤーの状態を送信
 */
export function sendPlayerState(
  room: Room,
  data: {
    position?: Vector3;
    rotation?: Euler;
    isMoving?: boolean;
    animationState?: string;
  },
) {
  const payload: Record<string, number | boolean | string> = {};

  if (data.position) {
    payload.x = data.position.x;
    payload.y = data.position.y;
    payload.z = data.position.z;
  }

  if (data.rotation) {
    payload.rotationX = data.rotation.x;
    payload.rotationY = data.rotation.y;
    payload.rotationZ = data.rotation.z;
  }

  if (data.isMoving !== undefined) {
    payload.isMoving = data.isMoving;
  }

  if (data.animationState) {
    payload.animationState = data.animationState;
  }

  room.send("updatePlayer", payload);
}

/**
 * ルームから退出
 */
export async function leaveRoom() {
  await useRoomStore.getState().disconnect();
  useRemotePlayersStore.getState().clearAll();
}
