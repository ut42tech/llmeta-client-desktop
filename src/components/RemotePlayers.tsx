import { RemotePlayer } from "@/components/RemotePlayer";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";

export const RemotePlayers = () => {
  const players = useRemotePlayersStore((state) => state.players);

  return (
    <>
      {Array.from(players.entries()).map(([playerId, player]) => (
        <RemotePlayer key={playerId} playerId={playerId} player={player} />
      ))}
    </>
  );
};
