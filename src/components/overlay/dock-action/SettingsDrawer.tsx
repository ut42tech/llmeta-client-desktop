"use client";

import { Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Euler, Vector3 } from "three";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalPlayerStore } from "@/stores/localPlayerStore";
import { MessageType, useColyseusRoom } from "@/utils/colyseus";

const SettingsContentClient = () => {
  const room = useColyseusRoom();
  const username = useLocalPlayerStore((s) => s.username) || "Player";
  const position = useLocalPlayerStore((s) => s.position);
  const setUsername = useLocalPlayerStore((s) => s.setUsername);
  const teleport = useLocalPlayerStore((s) => s.teleport);

  const [nameInput, setNameInput] = useState<string>(username);
  const isNameChanged = useMemo(
    () => nameInput.trim() !== "" && nameInput.trim() !== username,
    [nameInput, username],
  );

  const isFPV = useLocalPlayerStore((s) => s.isFPV);
  const toggleFPV = useLocalPlayerStore((s) => s.toggleFPV);

  const handleUpdateName = () => {
    const newName = nameInput.trim();
    if (!newName) return;
    setUsername(newName);
    if (room) {
      try {
        room.send(MessageType.CHANGE_PROFILE, { username: newName });
      } catch {
        // no-op
      }
    }
  };

  const handleResetPosition = () => {
    teleport(new Vector3(0, 0, 0), new Euler(0, 0, 0));
  };

  return (
    <div className="px-4 pb-6">
      <div className="space-y-6">
        {/* View Mode */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">View</h3>
          <div className="flex items-center justify-between py-3 border rounded-md px-3">
            <div className="text-sm text-muted-foreground">
              Mode: {isFPV ? "First Person" : "Third Person"}
            </div>
            <Button variant="outline" onClick={toggleFPV}>
              Toggle FPV
            </Button>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Username</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 h-10 px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={handleUpdateName} disabled={!isNameChanged}>
              Update
            </Button>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Position</h3>
          <div className="flex items-center justify-between py-3 border rounded-md px-3">
            <div className="text-sm text-muted-foreground">
              x: {position.x.toFixed(2)} / y: {position.y.toFixed(2)} / z:{" "}
              {position.z.toFixed(2)}
            </div>
            <Button variant="outline" onClick={handleResetPosition}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsDrawer = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return (
    <Drawer>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>
            <Button size="icon-lg" variant="secondary" aria-label="Settings">
              <Settings />
            </Button>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>Settings</TooltipContent>
      </Tooltip>

      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-2xl font-bold">Settings</DrawerTitle>
            <DrawerDescription className="p-3 bg-neutral-100 rounded-lg">
              ⚙️ Update your preferences
            </DrawerDescription>
          </DrawerHeader>
          {isClient ? (
            <SettingsContentClient />
          ) : (
            <div className="px-4 pb-6">
              <div className="h-24 rounded-md border border-dashed bg-muted/30" />
            </div>
          )}

          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
