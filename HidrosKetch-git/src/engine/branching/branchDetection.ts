import type { HydroFlowEdge, HydroFlowNode } from "../../editor/editor.types";
import type { BranchingMode } from "../../types/hydraulic.types";

export type DetectedBranch = {
  nodeId: string;
  nodeName: string;
  branchingMode: BranchingMode;
  branchCount: number;
  outgoingConnectionCount: number;
  defaultData: Record<string, unknown>;
};

export function isBranchNode(node: HydroFlowNode): boolean {
  const data = node.data.defaultData;

  const accessoryType = String(data.accessoryType ?? "");
  const catalogItemId = node.data.catalogItemId;

  return (
    node.data.componentKind === "accessory" &&
    (accessoryType === "tee_straight" ||
      accessoryType === "tee_branch" ||
      catalogItemId === "tee_straight" ||
      catalogItemId === "tee_branch")
  );
}

export function detectBranchNodes(
  nodes: HydroFlowNode[],
  edges: HydroFlowEdge[]
): DetectedBranch[] {
  return nodes.filter(isBranchNode).map((node) => {
    const outgoingConnectionCount = edges.filter(
      (edge) => edge.source === node.id
    ).length;

    const branchCountFromData = Number(node.data.defaultData.branchCount ?? 2);

    const branchCount = Math.max(
      2,
      Number.isFinite(branchCountFromData) ? branchCountFromData : 2,
      outgoingConnectionCount || 0
    );

    return {
      nodeId: node.id,
      nodeName: node.data.label,
      branchingMode: getBranchingMode(node.data.defaultData.branchingMode),
      branchCount,
      outgoingConnectionCount,
      defaultData: node.data.defaultData,
    };
  });
}

function getBranchingMode(value: unknown): BranchingMode {
  if (
    value === "manual" ||
    value === "percentage" ||
    value === "equal" ||
    value === "demand"
  ) {
    return value;
  }

  return "equal";
}