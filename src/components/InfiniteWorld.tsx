import { Text } from "@react-three/drei";
import { BvhPhysicsBody, PrototypeBox } from "@react-three/viverse";
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

const GridCell = ({ gridX, gridY, cellX, cellY }: GridCellProps) => {
  return (
    <group position={[gridX * GRID_CELL_SIZE, 0, gridY * GRID_CELL_SIZE]}>
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
};

export const InfiniteWorld = ({ ...props }) => {
  const currentGridCell = useWorldStore((state) => state.currentGridCell);
  const visibleGridSize = useWorldStore((state) => state.visibleGridSize);

  // Calculate grid centering offset
  const halfGridWidth = visibleGridSize.x / 2;
  const halfGridHeight = visibleGridSize.y / 2;
  const centerOffsetX = -halfGridWidth * GRID_CELL_SIZE + HALF_GRID_CELL_SIZE;
  const centerOffsetZ = -halfGridHeight * GRID_CELL_SIZE + HALF_GRID_CELL_SIZE;

  // Generate grid cells
  const gridCells = [];
  for (let x = 0; x < visibleGridSize.x; x++) {
    for (let y = 0; y < visibleGridSize.y; y++) {
      const cellX = x + currentGridCell.x - Math.floor(halfGridWidth);
      const cellY = y + currentGridCell.y - Math.floor(halfGridHeight);
      const gridX = x + currentGridCell.x;
      const gridY = y + currentGridCell.y;

      gridCells.push(
        <GridCell
          key={`${x}-${y}`}
          gridX={gridX}
          gridY={gridY}
          cellX={cellX}
          cellY={cellY}
        />,
      );
    }
  }

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
};
