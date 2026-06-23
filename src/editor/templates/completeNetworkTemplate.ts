import { MarkerType } from "@xyflow/react";

import { COMPONENT_CATALOG } from "../../domain/catalogs/componentCatalog";
import type { HydroFlowEdge, HydroFlowNode } from "../editor.types";

function getCatalogItem(catalogItemId: string) {
  const item = COMPONENT_CATALOG.find((component) => component.id === catalogItemId);

  if (!item) {
    throw new Error(`Componente de catalogo nao encontrado: ${catalogItemId}`);
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
    id: `complete_${index}_${catalogItemId}`,
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
  target: string,
  label = "Fluxo"
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
      label,
    },
  };
}

export function createCompleteHydraulicNetworkTemplate(): {
  nodes: HydroFlowNode[];
  edges: HydroFlowEdge[];
} {
  const nodes: HydroFlowNode[] = [
    createTemplateNode("open_reservoir", 1, { x: 80, y: 260 }, {
      role: "source",
      elevationM: 0,
      surfacePressureKpa: 0,
      isOpenToAtmosphere: true,
    }),
    createTemplateNode("entrance", 2, { x: 300, y: 260 }, {
      diameterMm: 40,
      kValue: 0.5,
    }),
    createTemplateNode("pump", 3, { x: 520, y: 260 }, {
      headMca: 25,
      efficiencyPercent: 70,
      powerKw: 1.1,
      flowDirection: "source-to-target",
    }),
    createTemplateNode("check_valve", 4, { x: 740, y: 260 }, {
      diameterMm: 40,
      kValue: 2.5,
      state: "open",
    }),
    createTemplateNode("pipe", 5, { x: 960, y: 260 }, {
      diameterMm: 40,
      lengthM: 12,
      material: "PVC",
    }),
    createTemplateNode("tee_branch", 6, { x: 1180, y: 260 }, {
      diameterMm: 40,
      kValue: 1.8,
    }),

    createTemplateNode("pipe", 7, { x: 1400, y: 95 }, {
      diameterMm: 32,
      lengthM: 8,
      material: "PVC",
    }),
    createTemplateNode("gate_valve_open", 8, { x: 1620, y: 95 }, {
      diameterMm: 32,
      kValue: 0.2,
      state: "open",
    }),
    createTemplateNode("curve_45", 9, { x: 1840, y: 95 }, {
      diameterMm: 32,
      kValue: 0.2,
    }),
    createTemplateNode("tank", 10, { x: 2060, y: 95 }, {
      role: "destination",
      baseElevationM: 8,
      waterLevelM: 2,
      topPressureKpa: 0,
      isOpenToAtmosphere: true,
    }),

    createTemplateNode("pipe", 11, { x: 1400, y: 260 }, {
      diameterMm: 40,
      lengthM: 10,
      material: "PVC",
    }),
    createTemplateNode("tee_branch", 12, { x: 1620, y: 260 }, {
      diameterMm: 40,
      kValue: 1.8,
    }),
    createTemplateNode("pipe", 13, { x: 1840, y: 260 }, {
      diameterMm: 40,
      lengthM: 15,
      material: "PVC",
    }),
    createTemplateNode("elbow_90_short", 14, { x: 2060, y: 260 }, {
      diameterMm: 40,
      kValue: 0.9,
    }),
    createTemplateNode("pipe", 15, { x: 2280, y: 260 }, {
      diameterMm: 40,
      lengthM: 12,
      material: "PVC",
    }),
    createTemplateNode("tank", 16, { x: 2500, y: 260 }, {
      role: "destination",
      baseElevationM: 12,
      waterLevelM: 2,
      topPressureKpa: 0,
      isOpenToAtmosphere: true,
    }),

    createTemplateNode("pipe", 17, { x: 1840, y: 430 }, {
      diameterMm: 25,
      lengthM: 9,
      material: "PVC",
    }),
    createTemplateNode("globe_valve_open", 18, { x: 2060, y: 430 }, {
      diameterMm: 25,
      kValue: 10,
      state: "open",
    }),
    createTemplateNode("elbow_45", 19, { x: 2280, y: 430 }, {
      diameterMm: 25,
      kValue: 0.4,
    }),
    createTemplateNode("exit", 20, { x: 2500, y: 430 }, {
      diameterMm: 25,
      kValue: 1.0,
    }),

    createTemplateNode("flow_instrument", 21, { x: 960, y: 410 }, {
      instrumentType: "flow",
      displayUnit: "L/s",
    }),
    createTemplateNode("pressure_instrument", 22, { x: 740, y: 410 }, {
      instrumentType: "pressure",
      displayUnit: "kPa",
    }),
    createTemplateNode("head_loss_instrument", 23, { x: 1180, y: 430 }, {
      instrumentType: "head_loss",
      displayUnit: "mca",
    }),
    createTemplateNode("label", 24, { x: 80, y: 500 }, {
      text: "Rede demonstrativa completa: linha principal com tres ramais, bomba, valvulas, acessorios e pontos de consumo.",
      showInReport: true,
    }),
  ];

  const edges: HydroFlowEdge[] = [
    createTemplateEdge("complete_edge_1", nodes[0].id, nodes[1].id, "Origem"),
    createTemplateEdge("complete_edge_2", nodes[1].id, nodes[2].id, "Succao"),
    createTemplateEdge("complete_edge_3", nodes[2].id, nodes[3].id, "Recalque"),
    createTemplateEdge("complete_edge_4", nodes[3].id, nodes[4].id, "Principal"),
    createTemplateEdge("complete_edge_5", nodes[4].id, nodes[5].id, "Principal"),

    createTemplateEdge("complete_edge_6_branch_top", nodes[5].id, nodes[6].id, "Ramal 1"),
    createTemplateEdge("complete_edge_7_branch_top", nodes[6].id, nodes[7].id, "Ramal 1"),
    createTemplateEdge("complete_edge_8_branch_top", nodes[7].id, nodes[8].id, "Ramal 1"),
    createTemplateEdge("complete_edge_9_branch_top", nodes[8].id, nodes[9].id, "Saida 1"),

    createTemplateEdge("complete_edge_10_main", nodes[5].id, nodes[10].id, "Principal"),
    createTemplateEdge("complete_edge_11_main", nodes[10].id, nodes[11].id, "Principal"),
    createTemplateEdge("complete_edge_12_main", nodes[11].id, nodes[12].id, "Principal"),
    createTemplateEdge("complete_edge_13_main", nodes[12].id, nodes[13].id, "Principal"),
    createTemplateEdge("complete_edge_14_main", nodes[13].id, nodes[14].id, "Principal"),
    createTemplateEdge("complete_edge_15_main", nodes[14].id, nodes[15].id, "Destino"),

    createTemplateEdge("complete_edge_16_branch_bottom", nodes[11].id, nodes[16].id, "Ramal 2"),
    createTemplateEdge("complete_edge_17_branch_bottom", nodes[16].id, nodes[17].id, "Ramal 2"),
    createTemplateEdge("complete_edge_18_branch_bottom", nodes[17].id, nodes[18].id, "Ramal 2"),
    createTemplateEdge("complete_edge_19_branch_bottom", nodes[18].id, nodes[19].id, "Saida 2"),
  ];

  return { nodes, edges };
}

