import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function InstrumentNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Instrumento de medição"
      symbol="◎"
      badge="Instrumento"
      selected={Boolean(selected)}
      accentClassName="bg-violet-500/20 text-violet-300"
      showInputHandle={false}
      showOutputHandle={false}
    />
  );
}