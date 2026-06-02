import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function PipeNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Trecho de tubulação"
      symbol="━"
      badge="Cano"
      selected={Boolean(selected)}
      accentClassName="bg-slate-700 text-slate-100"
      showInputHandle
      showOutputHandle
    />
  );
}