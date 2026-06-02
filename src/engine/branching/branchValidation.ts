import type { HydroFlowEdge, HydroFlowNode } from "../../editor/editor.types";
import type { ValidationIssue } from "../validation/validation.types";
import { buildValidationIssue } from "../validation/validationMessages";
import { detectBranchNodes } from "./branchDetection";
import { distributeBranchFlow, parseBranchNumberList } from "./flowDistribution";

export function validateEditorBranching(
  nodes: HydroFlowNode[],
  edges: HydroFlowEdge[],
  totalFlowLps: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const branches = detectBranchNodes(nodes, edges);

  for (const branch of branches) {
    const distribution = distributeBranchFlow({
      totalFlowLps,
      branchCount: branch.branchCount,
      mode: branch.branchingMode,
      manualFlowsLps: parseBranchNumberList(branch.defaultData.branchManualFlowsText),
      percentages: parseBranchNumberList(branch.defaultData.branchPercentagesText),
      demandsLps: parseBranchNumberList(branch.defaultData.branchDemandsText),
    });

    for (const error of distribution.errors) {
      issues.push(
        buildValidationIssue({
          code: getErrorCode(branch.branchingMode),
          severity: "error",
          componentId: branch.nodeId,
          message: `Ramificação "${branch.nodeName}": ${error}`,
        })
      );
    }

    for (const warning of distribution.warnings) {
      issues.push(
        buildValidationIssue({
          code: "branching_simplified",
          severity: "warning",
          componentId: branch.nodeId,
          message: `Ramificação "${branch.nodeName}": ${warning}`,
        })
      );
    }
  }

  return issues;
}

function getErrorCode(mode: string): ValidationIssue["code"] {
  if (mode === "manual") {
    return "invalid_branch_manual_sum";
  }

  if (mode === "percentage") {
    return "invalid_branch_percentage_sum";
  }

  if (mode === "demand") {
    return "missing_branch_demands";
  }

  return "invalid_branch_count";
}