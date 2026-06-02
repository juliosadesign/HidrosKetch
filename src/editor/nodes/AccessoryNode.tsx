import type { NodeProps } from "@xyflow/react";
import { HydroNodeShell } from "./HydroNodeShell";
import type { HydroNodeData } from "../editor.types";

export function AccessoryNode({ data, selected }: NodeProps) {
  const nodeData = data as HydroNodeData;

  const isEntrance = nodeData.catalogItemId === "entrance";
  const isExit = nodeData.catalogItemId === "exit";

  return (
    <HydroNodeShell
      title={nodeData.label}
      subtitle="Acessório com coeficiente K"
      symbol="⌁"
      badge="K"
      selected={Boolean(selected)}
      accentClassName="bg-amber-500/20 text-amber-300"
      showInputHandle={!isEntrance}
      showOutputHandle={!isExit}
    />
  );
}