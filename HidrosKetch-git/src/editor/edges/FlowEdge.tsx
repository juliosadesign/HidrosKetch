import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

// Edge alternativo para fluxos futuros.
// Na Sprint 6, o PipeEdge será o principal.
// Este fica preparado para expansão visual.
export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        strokeWidth: selected ? 4 : 2,
        stroke: selected ? "#a5f3fc" : "#22d3ee",
        strokeDasharray: "8 6",
      }}
    />
  );
}