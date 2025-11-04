import { useEffect, useState } from "react";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useMultiplayerStore } from "@/stores/multiplayerStore";

/**
 * Multiplayer connection UI component
 */
export const MultiplayerConnection = () => {
  const [username, setUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const connectionState = useMultiplayerStore((state) => state.connectionState);
  const error = useMultiplayerStore((state) => state.error);
  const connect = useMultiplayerStore((state) => state.connect);
  const disconnect = useMultiplayerStore((state) => state.disconnect);

  const localUsername = useLocalPlayerStore((state) => state.username);
  const setLocalUsername = useLocalPlayerStore((state) => state.setUsername);

  useEffect(() => {
    if (!username && localUsername) {
      setUsername(localUsername);
    }
  }, [localUsername, username]);

  const handleConnect = async () => {
    if (!username.trim()) return;

    setIsConnecting(true);
    setLocalUsername(username);

    try {
      await connect(username);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && connectionState === "disconnected") {
      handleConnect();
    }
  };

  const isButtonDisabled = isConnecting || !username.trim();

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white p-2.5 rounded min-w-[200px]">
      <div className="mb-2.5 font-bold">Multiplayer</div>

      {connectionState === "disconnected" && (
        <div>
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Username"
            disabled={isConnecting}
            className="w-full p-1.5 mb-1.5 rounded-sm border border-gray-600 bg-gray-800 text-white placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={handleConnect}
            disabled={isButtonDisabled}
            className="w-full p-1.5 rounded-sm border-none bg-blue-600 text-white cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      )}

      {connectionState === "connecting" && <div>Connecting...</div>}

      {connectionState === "connected" && (
        <div>
          <div className="mb-1.5 text-xs">Connected: {localUsername}</div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="w-full p-1.5 rounded-sm border-none bg-red-600 text-white cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      )}

      {connectionState === "error" && (
        <div>
          <div className="mb-1.5 text-xs text-red-400">Error: {error}</div>
          <button
            type="button"
            onClick={handleConnect}
            disabled={isButtonDisabled}
            className="w-full p-1.5 rounded-sm border-none bg-blue-600 text-white cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
