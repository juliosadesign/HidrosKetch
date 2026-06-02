import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type PumpPropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function PumpProperties({ node, onUpdate }: PumpPropertiesProps) {
    const data = node.data.defaultData;
  
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Propriedades da bomba
        </h2>
  
        <label className="block text-xs text-slate-400">
          Carga da bomba H_b mca
          <input
            type="number"
            step="0.1"
            value={String(data.headMca ?? "")}
            onChange={(event) =>
              onUpdate({
                headMca:
                  event.target.value === "" ? 0 : Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>
    );
  }