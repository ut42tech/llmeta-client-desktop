import type { Vector3 } from "three";
import { create } from "zustand";

// Grid constants
export const GRID_CELL_SIZE = 20;
export const HALF_GRID_CELL_SIZE = GRID_CELL_SIZE / 2;

// Types
type GridCoordinates = {
  x: number;
  y: number;
};

type WorldState = {
  currentGridCell: GridCoordinates;
  visibleGridSize: GridCoordinates;
};

type WorldActions = {
  updateCurrentGridCell: (position: Vector3) => void;
};

type WorldStore = WorldState & WorldActions;

// Constants
const INITIAL_GRID_CELL: GridCoordinates = { x: 0, y: 0 };
const DEFAULT_VISIBLE_GRID_SIZE: GridCoordinates = { x: 3, y: 3 };

// Helper functions
const calculateGridCell = (position: Vector3): GridCoordinates => ({
  x: Math.floor((position.x + HALF_GRID_CELL_SIZE) / GRID_CELL_SIZE),
  y: Math.floor((position.z + HALF_GRID_CELL_SIZE) / GRID_CELL_SIZE),
});

const isGridCellEqual = (
  cell1: GridCoordinates,
  cell2: GridCoordinates,
): boolean => cell1.x === cell2.x && cell1.y === cell2.y;

/**
 * ワールド状態管理ストア
 * グリッドベースの無限ワールドシステムを管理
 */
export const useWorldStore = create<WorldStore>((set) => ({
  // State
  currentGridCell: { ...INITIAL_GRID_CELL },
  visibleGridSize: { ...DEFAULT_VISIBLE_GRID_SIZE },

  // Actions
  updateCurrentGridCell: (position: Vector3) => {
    const newGridCell = calculateGridCell(position);

    // グリッドセルが変わった場合のみ更新（パフォーマンス最適化）
    set((state) => {
      if (isGridCellEqual(state.currentGridCell, newGridCell)) {
        return state; // 変更なし
      }

      return {
        currentGridCell: newGridCell,
      };
    });
  },
}));
