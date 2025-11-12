"use client";

import { ConnectionStatusBadge } from "@/components/overlay/ConnectionStatusBadge";
import { InfoRow } from "@/components/overlay/InfoRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/stores/connectionStore";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { useRemotePlayersStore } from "@/stores/remotePlayersStore";

export const OverlayUI = () => {
  const status = useConnectionStore((state) => state.status);
  const error = useConnectionStore((state) => state.error);
  const playersCount = useRemotePlayersStore((state) => state.players.size);
  const sessionId = useLocalPlayerStore((state) => state.sessionId);
  const username = useLocalPlayerStore((state) => state.username);

  return (
    <div className={cn("fixed z-50 inset-0 p-4 pointer-events-none")}>
      <TooltipProvider>
        <div className="flex flex-col gap-2 max-w-sm pointer-events-auto">
          <Card className="/backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Connection Status</CardTitle>
                <ConnectionStatusBadge status={status} error={error} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <InfoRow
                label="Players"
                value={<span className="font-medium">{playersCount}</span>}
              />

              <Separator />

              <InfoRow
                label="Session"
                value={
                  <span className="font-mono text-xs break-all">
                    {sessionId || "—"}
                  </span>
                }
              />

              <InfoRow
                label="Your name"
                value={
                  <span className="font-medium">{username || "Player"}</span>
                }
              />
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </div>
  );
};
