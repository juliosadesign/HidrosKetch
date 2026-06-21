import type {
  HydroFlowNode,
  UpdateSelectedNodeData,
} from "../../editor/editor.types";

import { BranchProperties } from "./BranchProperties";

type AccessoryPropertiesProps = {
  node: HydroFlowNode;
  onUpdate: UpdateSelectedNodeData;
};

export function AccessoryProperties({
  node,
  onUpdate,
}: AccessoryPropertiesProps) {
  const data = node.data.defaultData;

  const isBranchAccessory =
    data.accessoryType === "tee_straight" || data.accessoryType === "tee_branch";

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">
        Propriedades do acessório
      </h2>

      <label className="block text-xs text-slate-400">
        Coeficiente K
        <input
          type="number"
          step="0.01"
          value={String(data.kValue ?? "")}
          onChange={(event) =>
            onUpdate({
              kValue:
                event.target.value === "" ? null : Number(event.target.value),
            })
          }
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        />
      </label>

      <label className="block text-xs text-slate-400">
        Diâmetro mm
        <input
          type="number"
          value={String(data.diameterMm ?? "")}
          onChange={(event) =>
            onUpdate({
              diameterMm:
                event.target.value === "" ? null : Number(event.target.value),
            })
          }
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        />
      </label>

      {isBranchAccessory && <BranchProperties node={node} onUpdate={onUpdate} />}
    </div>
  );
}