import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function ValveNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Válvula / registro"
      symbol="◁▷"
      badge="Válvula"
      selected={Boolean(selected)}
      accentClassName="bg-blue-500/20 text-blue-300"
      showInputHandle
      showOutputHandle
    />
  );
}