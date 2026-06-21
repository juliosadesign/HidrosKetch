import type { Dispatch, SetStateAction } from "react";

import type { OnEdgesChange, OnNodesChange } from "@xyflow/react";

import { HydroEditor } from "./HydroEditor";

import type {
  AddComponentRequest,
  EditorScaleSettings,
  HydroFlowEdge,
  HydroFlowNode,
  ProjectVisualState,
} from "./editor.types";

type HydroSketchCanvasProps = {
  addRequest: AddComponentRequest | null;

  nodes: HydroFlowNode[];
  edges: HydroFlowEdge[];

  setNodes: Dispatch<SetStateAction<HydroFlowNode[]>>;
  setEdges: Dispatch<SetStateAction<HydroFlowEdge[]>>;

  onNodesChange: OnNodesChange<HydroFlowNode>;
  onEdgesChange: OnEdgesChange<HydroFlowEdge>;

  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;

  projectState: ProjectVisualState;
  setProjectState: Dispatch<SetStateAction<ProjectVisualState>>;

  scaleSettings: EditorScaleSettings;
};

export function HydroSketchCanvas(props: HydroSketchCanvasProps) {
  return (
    <section className="relative min-h-0 overflow-hidden bg-slate-950">
      <HydroEditor {...props} />
    </section>
  );
}