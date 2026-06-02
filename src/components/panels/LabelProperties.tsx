import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type LabelPropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function LabelProperties({ node, onUpdate }: LabelPropertiesProps) {
    const data = node.data.defaultData;
  
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Propriedades da anotação
        </h2>
  
        <label className="block text-xs text-slate-400">
          Texto
          <textarea
            value={String(data.text ?? "")}
            onChange={(event) =>
              onUpdate(
                { text: event.target.value },
                { label: event.target.value || "Texto anotativo" }
              )
            }
            rows={4}
            className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
  
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={Boolean(data.showInReport)}
            onChange={(event) => onUpdate({ showInReport: event.target.checked })}
          />
          Mostrar no relatório
        </label>
      </div>
    );
  }