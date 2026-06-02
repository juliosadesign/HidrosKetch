import type { HydroFlowEdge, HydroFlowNode } from "../editor.types";
import { pixelsToMeters } from "../ruler/scaleUtils";

export function calculateDistancePxBetweenNodes(
  source: HydroFlowNode,
  target: HydroFlowNode
): number {
  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateEdgeLengthMeters(
  edge: HydroFlowEdge,
  nodes: HydroFlowNode[],
  pixelsPerMeter: number
): number | null {
  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const distancePx = calculateDistancePxBetweenNodes(sourceNode, targetNode);

  return pixelsToMeters(distancePx, pixelsPerMeter);
}