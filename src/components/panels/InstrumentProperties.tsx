import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type InstrumentPropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function InstrumentProperties({
    node,
    onUpdate,
  }: InstrumentPropertiesProps) {
    const data = node.data.defaultData;
  
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Propriedades do instrumento
        </h2>
  
        <label className="block text-xs text-slate-400">
          Unidade de exibição
          <input
            type="text"
            value={String(data.displayUnit ?? "")}
            onChange={(event) => onUpdate({ displayUnit: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
  
        <label className="block text-xs text-slate-400">
          Valor manual opcional
          <input
            type="number"
            value={String(data.manualValue ?? "")}
            onChange={(event) =>
              onUpdate({
                manualValue:
                  event.target.value === "" ? undefined : Number(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>
    );
  }