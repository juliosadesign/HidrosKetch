import type { HydroSketchProject } from "../../types/project.types";
import type { ValidationIssue } from "./validation.types";
import { buildValidationIssue } from "./validationMessages";

function projectHasBranching(project: HydroSketchProject): boolean {
  return project.components.some((component) => {
    if (component.kind === "accessory") {
      return (
        component.data.accessoryType === "tee_branch" ||
        component.data.accessoryType === "tee_straight"
      );
    }

    if (component.kind === "junction") {
      return component.data.junctionType === "branch";
    }

    return false;
  });
}

export function validateBranching(project: HydroSketchProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const hasBranching = projectHasBranching(project);

  if (!hasBranching) {
    return issues;
  }

  if (!project.settings.branchingMode) {
    issues.push(
      buildValidationIssue({
        code: "missing_branching_mode",
        severity: "error",
        message:
          "A rede possui ramificação, mas o modo de divisão de vazão não foi definido.",
      })
    );
  }

  if (project.settings.branchingMode === "equal") {
    issues.push(
      buildValidationIssue({
        code: "equal_branching_assumed",
        severity: "warning",
        message:
          "A vazão será dividida igualmente entre os ramos. Essa é uma simplificação da V1.",
      })
    );
  }

  return issues;
}