import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function LabelNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Anotação técnica"
      symbol="T"
      badge="Texto"
      selected={Boolean(selected)}
      accentClassName="bg-slate-600/30 text-slate-200"
      showInputHandle={false}
      showOutputHandle={false}
    />
  );
}