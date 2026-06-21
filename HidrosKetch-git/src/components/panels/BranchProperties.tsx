import type {
    HydroFlowNode,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  type BranchPropertiesProps = {
    node: HydroFlowNode;
    onUpdate: UpdateSelectedNodeData;
  };
  
  export function BranchProperties({ node, onUpdate }: BranchPropertiesProps) {
    const data = node.data.defaultData;
  
    const branchingMode = String(data.branchingMode ?? "equal");
    const branchCount = Number(data.branchCount ?? 2);
  
    return (
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Configuração de ramificação
        </h3>
  
        <p className="mt-2 text-xs leading-5 text-slate-300">
          A V1 usa divisão simplificada de vazão. Isso não é solver hidráulico
          completo.
        </p>
  
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-slate-400">
            Quantidade de ramos
            <input
              type="number"
              min={2}
              value={branchCount}
              onChange={(event) =>
                onUpdate({
                  branchCount: Math.max(2, Number(event.target.value)),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
  
          <label className="block text-xs text-slate-400">
            Modo de divisão
            <select
              value={branchingMode}
              onChange={(event) =>
                onUpdate({
                  branchingMode: event.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="equal">Automática igual</option>
              <option value="percentage">Percentual</option>
              <option value="manual">Manual</option>
              <option value="demand">Por demanda</option>
            </select>
          </label>
  
          {branchingMode === "percentage" && (
            <label className="block text-xs text-slate-400">
              Percentuais dos ramos
              <input
                type="text"
                placeholder="Ex.: 50,50 ou 70,30"
                value={String(data.branchPercentagesText ?? "")}
                onChange={(event) =>
                  onUpdate({
                    branchPercentagesText: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                A soma precisa ser 100%.
              </span>
            </label>
          )}
  
          {branchingMode === "manual" && (
            <label className="block text-xs text-slate-400">
              Vazões manuais dos ramos L/s
              <input
                type="text"
                placeholder="Ex.: 1.2,0.8"
                value={String(data.branchManualFlowsText ?? "")}
                onChange={(event) =>
                  onUpdate({
                    branchManualFlowsText: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                A soma precisa bater com a vazão total do projeto.
              </span>
            </label>
          )}
  
          {branchingMode === "demand" && (
            <label className="block text-xs text-slate-400">
              Demandas dos ramos L/s
              <input
                type="text"
                placeholder="Ex.: 1.5,0.5"
                value={String(data.branchDemandsText ?? "")}
                onChange={(event) =>
                  onUpdate({
                    branchDemandsText: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Cada ramo precisa ter uma demanda válida.
              </span>
            </label>
          )}
  
          {branchingMode === "equal" && (
            <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-100">
              A vazão será dividida igualmente entre os ramos. Isso é uma
              simplificação da V1.
            </div>
          )}
        </div>
      </div>
    );
  }