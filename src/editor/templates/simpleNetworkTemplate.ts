import { MarkerType } from "@xyflow/react";

import { COMPONENT_CATALOG } from "../../domain/catalogs/componentCatalog";
import type { HydroFlowEdge, HydroFlowNode } from "../editor.types";

function getCatalogItem(catalogItemId: string) {
  const item = COMPONENT_CATALOG.find((component) => component.id === catalogItemId);

  if (!item) {
    throw new Error(`Componente de catálogo não encontrado: ${catalogItemId}`);
  }

  return item;
}

function createTemplateNode(
  catalogItemId: string,
  index: number,
  position: { x: number; y: number },
  customData: Record<string, unknown> = {}
): HydroFlowNode {
  const item = getCatalogItem(catalogItemId);

  return {
    id: `auto_${index}_${catalogItemId}`,
    type: item.kind,
    position,
    selected: false,
    data: {
      label: item.name,
      description: item.description,
      catalogItemId: item.id,
      componentKind: item.kind,
      defaultData: {
        ...item.defaultData,
        ...customData,
      },
    },
  };
}

function createTemplateEdge(
  id: string,
  source: string,
  target: string
): HydroFlowEdge {
  return {
    id,
    source,
    target,
    sourceHandle: "out",
    targetHandle: "in",
    type: "pipe",
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#38bdf8",
    },
    data: {
      kind: "pipe",
      status: "outdated",
      label: "Cano / fluxo",
    },
  };
}

export function createSimpleHydraulicNetworkTemplate(): {
  nodes: HydroFlowNode[];
  edges: HydroFlowEdge[];
} {
  const nodes: HydroFlowNode[] = [
    createTemplateNode(
      "open_reservoir",
      1,
      { x: 80, y: 220 },
      {
        role: "source",
        elevationM: 0,
        surfacePressureKpa: 0,
        isOpenToAtmosphere: true,
      }
    ),
    createTemplateNode(
      "pump",
      2,
      { x: 310, y: 220 },
      {
        headMca: 20,
        efficiencyPercent: 70,
        powerKw: 0.75,
        flowDirection: "source-to-target",
      }
    ),
    createTemplateNode(
      "pipe",
      3,
      { x: 540, y: 220 },
      {
        diameterMm: 32,
        lengthM: 10,
        material: "PVC",
        flowDirection: "source-to-target",
      }
    ),
    createTemplateNode(
      "elbow_90_short",
      4,
      { x: 770, y: 220 },
      {
        diameterMm: 32,
        flowDirection: "source-to-target",
      }
    ),
    createTemplateNode(
      "pipe",
      5,
      { x: 1000, y: 220 },
      {
        diameterMm: 32,
        lengthM: 15,
        material: "PVC",
        flowDirection: "source-to-target",
      }
    ),
    createTemplateNode(
      "tank",
      6,
      { x: 1230, y: 220 },
      {
        role: "destination",
        baseElevationM: 10,
        waterLevelM: 2,
        topPressureKpa: 0,
        isOpenToAtmosphere: true,
      }
    ),
  ];

  const edges: HydroFlowEdge[] = [
    createTemplateEdge("auto_edge_1_reservoir_pump", nodes[0].id, nodes[1].id),
    createTemplateEdge("auto_edge_2_pump_pipe", nodes[1].id, nodes[2].id),
    createTemplateEdge("auto_edge_3_pipe_elbow", nodes[2].id, nodes[3].id),
    createTemplateEdge("auto_edge_4_elbow_pipe", nodes[3].id, nodes[4].id),
    createTemplateEdge("auto_edge_5_pipe_tank", nodes[4].id, nodes[5].id),
  ];

  return { nodes, edges };
}
