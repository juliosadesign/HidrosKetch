import type { HydroSketchProject } from "../../types/project.types";
import type { ValidationIssue, ProjectValidationResult } from "./validation.types";

import { buildValidationIssue } from "./validationMessages";
import { validateComponents } from "./validateComponents";
import { validateConnections } from "./validateConnections";
import { validateBranching } from "./validateBranching";

function hasOrigin(project: HydroSketchProject): boolean {
  return project.components.some((component) => {
    if (component.kind === "reservoir") {
      return component.data.role === "source";
    }

    if (component.kind === "tank") {
      return component.data.role === "source";
    }

    if (component.kind === "junction") {
      return component.data.junctionType === "source";
    }

    return false;
  });
}

function hasDestination(project: HydroSketchProject): boolean {
  return project.components.some((component) => {
    if (component.kind === "reservoir") {
      return component.data.role === "destination";
    }

    if (component.kind === "tank") {
      return component.data.role === "destination";
    }

    if (component.kind === "junction") {
      return component.data.junctionType === "destination";
    }

    if (component.kind === "accessory") {
      return component.data.accessoryType === "exit";
    }

    return false;
  });
}

function validateGeneralProjectData(project: HydroSketchProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!hasOrigin(project)) {
    issues.push(
      buildValidationIssue({
        code: "missing_origin",
        severity: "error",
        message: "Defina um poço, reservatório, tanque ou nó como origem do sistema.",
      })
    );
  }

  if (!hasDestination(project)) {
    issues.push(
      buildValidationIssue({
        code: "missing_destination",
        severity: "error",
        message: "Defina um reservatório, tanque, saída ou nó como destino do sistema.",
      })
    );
  }

  const flow = project.settings.defaultFlowLps;

  if (flow === null || flow === undefined || flow <= 0) {
    issues.push(
      buildValidationIssue({
        code: "invalid_flow",
        severity: "error",
        message: "Informe uma vazão principal válida em L/s.",
      })
    );
  }

  const scale = project.settings.scale;

  if (
    !scale ||
    scale.pixelsPerMeter <= 0 ||
    scale.gridSpacingPx <= 0
  ) {
    issues.push(
      buildValidationIssue({
        code: "invalid_scale",
        severity: "error",
        message: "Configure uma escala real válida para a prancheta.",
      })
    );
  }

  return issues;
}

function validateProjectWarnings(project: HydroSketchProject): ValidationIssue[] {
  const warnings: ValidationIssue[] = [];

  for (const component of project.components) {
    if (
      component.kind === "reservoir" &&
      component.data.isOpenToAtmosphere &&
      component.data.surfacePressureKpa === 0
    ) {
      warnings.push(
        buildValidationIssue({
          code: "atmospheric_pressure_assumed",
          severity: "warning",
          componentId: component.id,
          message: `O reservatório/poço "${component.name}" está aberto à atmosfera. Pressão manométrica assumida como 0 kPa.`,
        })
      );
    }

    if (
      component.kind === "tank" &&
      component.data.isOpenToAtmosphere &&
      component.data.topPressureKpa === 0
    ) {
      warnings.push(
        buildValidationIssue({
          code: "atmospheric_pressure_assumed",
          severity: "warning",
          componentId: component.id,
          message: `O tanque "${component.name}" está aberto à atmosfera. Pressão manométrica assumida como 0 kPa.`,
        })
      );
    }
  }

  warnings.push(
    buildValidationIssue({
      code: "simplified_pressure_estimation",
      severity: "warning",
      message:
        "A pressão da V1 é uma estimativa simplificada para o caminho analisado, não um solver completo de rede hidráulica.",
    })
  );

  return warnings;
}

export function validateProject(project: HydroSketchProject): ProjectValidationResult {
  const allIssues: ValidationIssue[] = [
    ...validateGeneralProjectData(project),
    ...validateComponents(project),
    ...validateConnections(project),
    ...validateBranching(project),
    ...validateProjectWarnings(project),
  ];

  const errors = allIssues.filter((issue) => issue.severity === "error");
  const warnings = allIssues.filter((issue) => issue.severity === "warning");

  return {
    canCalculate: errors.length === 0,
    errors,
    warnings,
  };
}