import { Text } from "@react-three/drei";
import { BvhPhysicsBody, PrototypeBox } from "@react-three/viverse";
import { memo, useMemo } from "react";
import {
  GRID_CELL_SIZE,
  HALF_GRID_CELL_SIZE,
  useWorldStore,
} from "@/stores/worldStore";

type GridCellProps = {
  gridX: number;
  gridY: number;
  cellX: number;
  cellY: number;
};

/**
 * グリッドセル単体のコンポーネント
 */
const GridCell = memo(
  ({ gridX, gridY, cellX, cellY }: GridCellProps) => {
    const positionX = useMemo(() => gridX * GRID_CELL_SIZE, [gridX]);
    const positionZ = useMemo(() => gridY * GRID_CELL_SIZE, [gridY]);

    return (
      <group position={[positionX, 0, positionZ]}>
        <BvhPhysicsBody kinematic>
          <PrototypeBox
            scale={[GRID_CELL_SIZE, 1, GRID_CELL_SIZE]}
            position={[0, -2, 0]}
          />
        </BvhPhysicsBody>
        <Text
          fontSize={1}
          position-y={-1.49}
          rotation-x={-Math.PI / 2}
          fontWeight={"bold"}
          textAlign="center"
          lineHeight={1}
          receiveShadow
        >
          CELL{"\n"}[{cellX}, {cellY}]
          <meshStandardMaterial color="white" />
        </Text>
      </group>
    );
  },
  (prev, next) =>
    prev.gridX === next.gridX &&
    prev.gridY === next.gridY &&
    prev.cellX === next.cellX &&
    prev.cellY === next.cellY,
);

type InfiniteWorldProps = {
  [key: string]: unknown;
};

/**
 * 無限ワールドのグリッド表示コンポーネント
 */
export const InfiniteWorld = memo(({ ...props }: InfiniteWorldProps) => {
  const currentGridCell = useWorldStore((state) => state.currentGridCell);
  const visibleGridSize = useWorldStore((state) => state.visibleGridSize);

  // グリッドのオフセット計算
  const { centerOffsetX, centerOffsetZ, halfGridWidth, halfGridHeight } =
    useMemo(() => {
      const halfWidth = visibleGridSize.x / 2;
      const halfHeight = visibleGridSize.y / 2;
      return {
        centerOffsetX: -halfWidth * GRID_CELL_SIZE + HALF_GRID_CELL_SIZE,
        centerOffsetZ: -halfHeight * GRID_CELL_SIZE + HALF_GRID_CELL_SIZE,
        halfGridWidth: halfWidth,
        halfGridHeight: halfHeight,
      };
    }, [visibleGridSize.x, visibleGridSize.y]);

  // グリッドセル生成
  const gridCells = useMemo(() => {
    const cells = [];
    for (let x = 0; x < visibleGridSize.x; x++) {
      for (let y = 0; y < visibleGridSize.y; y++) {
        const cellX = x + currentGridCell.x - Math.floor(halfGridWidth);
        const cellY = y + currentGridCell.y - Math.floor(halfGridHeight);
        const gridX = x + currentGridCell.x;
        const gridY = y + currentGridCell.y;

        cells.push(
          <GridCell
            key={`${gridX}-${gridY}`}
            gridX={gridX}
            gridY={gridY}
            cellX={cellX}
            cellY={cellY}
          />,
        );
      }
    }
    return cells;
  }, [
    visibleGridSize.x,
    visibleGridSize.y,
    currentGridCell.x,
    currentGridCell.y,
    halfGridWidth,
    halfGridHeight,
  ]);

  return (
    <group
      {...props}
      position-x={centerOffsetX}
      position-y={-0.5}
      position-z={centerOffsetZ}
    >
      {gridCells}
    </group>
  );
});
