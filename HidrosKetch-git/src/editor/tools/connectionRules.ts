import type { Connection, Node } from "@xyflow/react";
import type { HydroNodeData } from "../editor.types";

export type ConnectionValidationResult = {
  valid: boolean;
  reason?: string;
};

const CONNECTABLE_KINDS = new Set([
  "pipe",
  "accessory",
  "valve",
  "pump",
  "reservoir",
  "tank",
  "junction",
]);

function isOutputHandle(handleId: string | null | undefined): boolean {
  return handleId === "out";
}

function isInputHandle(handleId: string | null | undefined): boolean {
  return handleId === "in";
}

function canParticipateInHydraulicConnection(
  node: Node<HydroNodeData> | undefined
): boolean {
  if (!node) return false;

  return CONNECTABLE_KINDS.has(node.data.componentKind);
}

// Validação básica da Sprint 6.
// Ainda não é a validação completa da Sprint 4.
// Aqui validamos apenas se uma conexão visual faz sentido.
export function validateHydroConnection(
  connection: Connection,
  nodes: Node<HydroNodeData>[]
): ConnectionValidationResult {
  if (!connection.source || !connection.target) {
    return {
      valid: false,
      reason: "A conexão precisa ter origem e destino.",
    };
  }

  if (connection.source === connection.target) {
    return {
      valid: false,
      reason: "Um componente não pode conectar nele mesmo.",
    };
  }

  if (!isOutputHandle(connection.sourceHandle)) {
    return {
      valid: false,
      reason: "A conexão deve começar em uma saída.",
    };
  }

  if (!isInputHandle(connection.targetHandle)) {
    return {
      valid: false,
      reason: "A conexão deve terminar em uma entrada.",
    };
  }

  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!canParticipateInHydraulicConnection(sourceNode)) {
    return {
      valid: false,
      reason: "O componente de origem não participa da conexão hidráulica.",
    };
  }

  if (!canParticipateInHydraulicConnection(targetNode)) {
    return {
      valid: false,
      reason: "O componente de destino não participa da conexão hidráulica.",
    };
  }

  if (sourceNode?.data.catalogItemId === "exit") {
    return {
      valid: false,
      reason: "A saída de tubulação deve atuar como destino, não como origem.",
    };
  }

  if (targetNode?.data.catalogItemId === "entrance") {
    return {
      valid: false,
      reason: "A entrada de tubulação deve atuar como origem de entrada, não como destino interno.",
    };
  }

  return {
    valid: true,
  };
}