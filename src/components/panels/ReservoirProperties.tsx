import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type ReservoirPropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function ReservoirProperties({
    node,
    onUpdate,
  }: ReservoirPropertiesProps) {
    const data = node.data.defaultData;
  
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Propriedades do reservatório
        </h2>
  
        <label className="block text-xs text-slate-400">
          Papel na rede
          <select
            value={String(data.role ?? "source")}
            onChange={(event) => onUpdate({ role: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value="source">Origem</option>
            <option value="destination">Destino</option>
            <option value="intermediate">Intermediário</option>
          </select>
        </label>
  
        <label className="block text-xs text-slate-400">
          Cota / nível m
          <input
            type="number"
            value={String(data.elevationM ?? "")}
            onChange={(event) =>
              onUpdate({
                elevationM:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
  
        <label className="block text-xs text-slate-400">
          Pressão superficial kPa
          <input
            type="number"
            value={String(data.surfacePressureKpa ?? 0)}
            onChange={(event) =>
              onUpdate({ surfacePressureKpa: Number(event.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>
    );
  }