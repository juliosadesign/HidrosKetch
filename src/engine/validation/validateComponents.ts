import type { HydroSketchProject } from "../../types/project.types";
import type { ValidationIssue } from "./validation.types";
import { buildValidationIssue } from "./validationMessages";

// Verifica problemas internos dos componentes:
// - cano sem diâmetro;
// - acessório sem K;
// - válvula sem K;
// - válvula fechada;
// - bomba sem carga válida.

export function validateComponents(project: HydroSketchProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const component of project.components) {
    switch (component.kind) {
      case "pipe": {
        if (
          component.data.diameterMm === null ||
          component.data.diameterMm === undefined ||
          component.data.diameterMm <= 0
        ) {
          issues.push(
            buildValidationIssue({
              code: "missing_pipe_diameter",
              severity: "error",
              componentId: component.id,
              message: `O cano "${component.name}" não possui diâmetro válido.`,
            })
          );
        }

        break;
      }

      case "accessory": {
        if (
          component.data.kValue === null ||
          component.data.kValue === undefined ||
          component.data.kValue < 0
        ) {
          issues.push(
            buildValidationIssue({
              code: "missing_accessory_k",
              severity: "error",
              componentId: component.id,
              message: `O acessório "${component.name}" não possui coeficiente K válido.`,
            })
          );
        }

        break;
      }

      case "valve": {
        if (
          component.data.kValue === null ||
          component.data.kValue === undefined ||
          component.data.kValue < 0
        ) {
          issues.push(
            buildValidationIssue({
              code: "missing_valve_k",
              severity: "error",
              componentId: component.id,
              message: `A válvula "${component.name}" não possui coeficiente K válido.`,
            })
          );
        }

        if (component.data.state === "closed") {
          issues.push(
            buildValidationIssue({
              code: "closed_valve",
              severity: "error",
              componentId: component.id,
              message: `A válvula "${component.name}" está fechada e interrompe o fluxo.`,
            })
          );
        }

        break;
      }

      case "pump": {
        if (
          component.data.headMca === null ||
          component.data.headMca === undefined ||
          component.data.headMca < 0
        ) {
          issues.push(
            buildValidationIssue({
              code: "invalid_pump_head",
              severity: "error",
              componentId: component.id,
              message: `A bomba "${component.name}" não possui carga H_b válida.`,
            })
          );
        }

        break;
      }

      default:
        break;
    }
  }

  return issues;
}