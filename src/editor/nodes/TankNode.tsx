import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function TankNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Tanque com nível"
      symbol="▥"
      badge="Tanque"
      selected={Boolean(selected)}
      accentClassName="bg-teal-500/20 text-teal-300"
      showInputHandle
      showOutputHandle
    />
  );
}