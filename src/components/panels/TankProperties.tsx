import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type TankPropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function TankProperties({ node, onUpdate }: TankPropertiesProps) {
    const data = node.data.defaultData;
  
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Propriedades do tanque
        </h2>
  
        <label className="block text-xs text-slate-400">
          Papel na rede
          <select
            value={String(data.role ?? "destination")}
            onChange={(event) => onUpdate({ role: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value="source">Origem</option>
            <option value="destination">Destino</option>
            <option value="intermediate">Intermediário</option>
          </select>
        </label>
  
        <label className="block text-xs text-slate-400">
          Cota da base m
          <input
            type="number"
            value={String(data.baseElevationM ?? "")}
            onChange={(event) =>
              onUpdate({
                baseElevationM:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
  
        <label className="block text-xs text-slate-400">
          Nível de água m
          <input
            type="number"
            value={String(data.waterLevelM ?? "")}
            onChange={(event) =>
              onUpdate({
                waterLevelM:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>
    );
  }