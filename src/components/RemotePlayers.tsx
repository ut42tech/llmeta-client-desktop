import { RemotePlayer } from "@/components/RemotePlayer";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";

export const RemotePlayers = () => {
  const players = useRemotePlayersStore((state) => state.players);

  return (
    <>
      {Array.from(players.values()).map((player) => (
        <RemotePlayer key={player.id} player={player} />
      ))}
    </>
  );
};
