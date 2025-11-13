"use client";

import { SettingsDrawer } from "@/components/overlay/dock-action/SettingsDrawer";
import { WorldInfoDrawer } from "@/components/overlay/dock-action/WorldInfoDrawer";
import { YourInfoDrawer } from "@/components/overlay/dock-action/YourInfoDrawer";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Dock = () => {
  return (
    <div className="absolute left-1/2 bottom-6 -translate-x-1/2 pointer-events-auto">
      <TooltipProvider>
        <div className="flex items-center gap-3">
          <WorldInfoDrawer />
          <YourInfoDrawer />
          <SettingsDrawer />
        </div>
      </TooltipProvider>
    </div>
  );
};
