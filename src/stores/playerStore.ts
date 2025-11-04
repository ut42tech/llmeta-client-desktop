import { Vector3 } from "three";
import { create } from "zustand";

const INITIAL_PLAYER_POSITION = new Vector3(0, 0, 0);

type PlayerState = {
  position: Vector3;
};

type PlayerActions = {
  setPosition: (position: Vector3) => void;
};

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set) => ({
  // State
  position: INITIAL_PLAYER_POSITION.clone(),

  // Actions
  setPosition: (position: Vector3) => {
    set({ position: position.clone() });
  },
}));
