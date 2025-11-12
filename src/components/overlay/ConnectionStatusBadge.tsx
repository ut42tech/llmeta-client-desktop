"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/stores/connectionStore";

type Props = {
  status: ConnectionStatus;
  error?: unknown;
  className?: string;
};

const statusConfig: Record<
  ConnectionStatus,
  { label: string; dotClass: string; badgeClass?: string }
> = {
  idle: { label: "Idle", dotClass: "bg-zinc-400" },
  connecting: { label: "Connecting…", dotClass: "bg-yellow-500" },
  connected: { label: "Connected", dotClass: "bg-green-500" },
  failed: {
    label: "Connection Failed",
    dotClass: "bg-red-500",
    badgeClass: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300",
  },
  disconnected: { label: "Disconnected", dotClass: "bg-zinc-400" },
};

export const ConnectionStatusBadge = ({ status, error, className }: Props) => {
  const cfg = statusConfig[status] ?? statusConfig.idle;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="secondary"
          className={cn("flex items-center gap-2", cfg.badgeClass, className)}
        >
          <span
            className={cn("h-2 w-2 rounded-full shadow-inner", cfg.dotClass)}
          />
          {cfg.label}
        </Badge>
      </TooltipTrigger>
      {status === "failed" && (
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-xs leading-snug">
            {error ? String(error) : "Unknown error"}
          </p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
