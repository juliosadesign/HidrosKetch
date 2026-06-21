import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function ReservoirNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Poço ou reservatório"
      symbol="▤"
      badge="Fonte"
      selected={Boolean(selected)}
      accentClassName="bg-emerald-500/20 text-emerald-300"
      showInputHandle={false}
      showOutputHandle
    />
  );
}