import type { ComponentCatalogItem } from "../domain/catalogs/componentCatalog";
import type { ComponentKind } from "../types/component.types";
import type { Edge, Node } from "@xyflow/react";

export type AddComponentRequest = {
  requestId: number;
  component: ComponentCatalogItem;
};

export type HydroNodeData = Record<string, unknown> & {
  label: string;
  description: string;
  catalogItemId: string;
  componentKind: ComponentKind;
  defaultData: Record<string, unknown>;
};

export type HydroEdgeData = Record<string, unknown> & {
  kind: "pipe";
  status: "draft" | "outdated";
  label: string;
};

export type HydroFlowNode = Node<HydroNodeData>;
export type HydroFlowEdge = Edge<HydroEdgeData>;

export type ProjectVisualState = "draft" | "outdated" | "calculated";

export type EditorScaleSettings = {
  pixelsPerMeter: number;
  gridSpacingPx: number;
  gridEnabled: boolean;
  rulerEnabled: boolean;
  snapEnabled: boolean;
};

export type UpdateNodeDataOptions = {
  label?: string;
};

export type UpdateSelectedNodeData = (
  updates: Record<string, unknown>,
  options?: UpdateNodeDataOptions
) => void;


export type ProjectEnergySettings = {
  // Altura/cota da origem usada como fallback quando não houver
  // reservatório, tanque ou nó de origem com cota definida.
  originElevationM: number;

  // Altura/cota do destino usada como fallback quando não houver
  // reservatório, tanque ou nó de destino com cota definida.
  destinationElevationM: number;

  // Pressão mínima desejada no ponto final, em kPa.
  // Nesta sprint ela entra apenas como carga necessária simplificada.
  requiredOutletPressureKpa: number;
};

export type UpdateProjectEnergySettings = (
  updates: Partial<ProjectEnergySettings>
) => void;

export type UpdateScaleSettings = (
  updates: Partial<EditorScaleSettings>
) => void;