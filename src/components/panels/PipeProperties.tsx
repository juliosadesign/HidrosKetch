import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type PipePropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function PipeProperties({ node, onUpdate }: PipePropertiesProps) {
    const data = node.data.defaultData;
  
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">Propriedades do cano</h2>
  
        <label className="block text-xs text-slate-400">
          Diâmetro interno mm
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
  
        <label className="block text-xs text-slate-400">
          Comprimento m
          <input
            type="number"
            value={String(data.lengthM ?? "")}
            onChange={(event) =>
              onUpdate({
                lengthM:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
  
        <label className="block text-xs text-slate-400">
          Material
          <input
            type="text"
            value={String(data.material ?? "")}
            onChange={(event) => onUpdate({ material: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>
    );
  }