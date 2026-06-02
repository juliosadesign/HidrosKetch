import { Background } from "@xyflow/react";

type GridOverlayProps = {
  enabled: boolean;
  gridSpacingPx: number;
};

export function GridOverlay({ enabled, gridSpacingPx }: GridOverlayProps) {
  if (!enabled) {
    return null;
  }

  return <Background gap={gridSpacingPx} size={1} color="#334155" />;
}