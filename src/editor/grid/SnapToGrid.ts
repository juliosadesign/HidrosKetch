import type { XYPosition } from "@xyflow/react";

export function snapNumberToGrid(value: number, gridSpacingPx: number): number {
  if (gridSpacingPx <= 0) {
    return value;
  }

  return Math.round(value / gridSpacingPx) * gridSpacingPx;
}

export function snapPositionToGrid(
  position: XYPosition,
  gridSpacingPx: number
): XYPosition {
  return {
    x: snapNumberToGrid(position.x, gridSpacingPx),
    y: snapNumberToGrid(position.y, gridSpacingPx),
  };
}