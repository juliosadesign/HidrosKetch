import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type ValvePropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function ValveProperties({ node, onUpdate }: ValvePropertiesProps) {
    const data = node.data.defaultData;
  
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Propriedades da válvula
        </h2>
  
        <label className="block text-xs text-slate-400">
          Estado da válvula
          <select
            value={String(data.state ?? "open")}
            onChange={(event) => onUpdate({ state: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value="open">Aberta</option>
            <option value="partial">Parcial</option>
            <option value="closed">Fechada</option>
          </select>
        </label>
  
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
      </div>
    );
  }