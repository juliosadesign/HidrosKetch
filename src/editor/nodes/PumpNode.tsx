import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function PumpNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Adiciona carga H_b"
      symbol="↻"
      badge="Bomba"
      selected={Boolean(selected)}
      accentClassName="bg-cyan-500/20 text-cyan-300"
      showInputHandle
      showOutputHandle
    />
  );
}