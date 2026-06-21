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

export type UpdateScaleSettings = (
  updates: Partial<EditorScaleSettings>
) => void;