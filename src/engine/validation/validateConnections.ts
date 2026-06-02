import type { HydroComponent } from "../../types/component.types";
import type { HydroSketchProject } from "../../types/project.types";
import type { ValidationIssue } from "./validation.types";
import { buildValidationIssue } from "./validationMessages";

// Componentes que precisam estar conectados na rede hidráulica.
// Label e instrumento podem existir soltos sem impedir cálculo,
// mas os componentes hidráulicos principais precisam de conexão.
function requiresHydraulicConnection(component: HydroComponent): boolean {
  return (
    component.kind === "pipe" ||
    component.kind === "accessory" ||
    component.kind === "valve" ||
    component.kind === "pump" ||
    component.kind === "reservoir" ||
    component.kind === "tank" ||
    component.kind === "junction"
  );
}

function isComponentConnected(project: HydroSketchProject, component: HydroComponent): boolean {
  const appearsInConnection = project.connections.some(
    (connection) =>
      connection.sourceComponentId === component.id ||
      connection.targetComponentId === component.id ||
      connection.pipeId === component.id
  );

  if (appearsInConnection) {
    return true;
  }

  // Cano pode também carregar conexão técnica própria.
  if (component.kind === "pipe") {
    return Boolean(component.data.sourceNodeId && component.data.targetNodeId);
  }

  // Junction pode carregar lista própria de componentes ligados.
  if (component.kind === "junction") {
    return component.data.connectedComponentIds.length > 0;
  }

  return false;
}

export function validateConnections(project: HydroSketchProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const component of project.components) {
    if (!requiresHydraulicConnection(component)) {
      continue;
    }

    const connected = isComponentConnected(project, component);

    if (!connected) {
      issues.push(
        buildValidationIssue({
          code: "disconnected_component",
          severity: "error",
          componentId: component.id,
          message: `O componente "${component.name}" está desconectado da rede.`,
        })
      );
    }
  }

  return issues;
}