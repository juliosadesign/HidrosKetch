// Painel direito de propriedades.
// Nesta Sprint, ele ainda não edita nada.
// Futuramente, ele mudará conforme o objeto selecionado.

export function PropertiesPanel() {
    return (
      <aside className="min-h-0 overflow-y-auto border-l border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">
            Painel de propriedades
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Nenhum componente selecionado no momento.
          </p>
        </div>
  
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Projeto
          </h3>
  
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Nome</span>
              <span className="text-slate-300">Projeto sem título</span>
            </div>
  
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Fluido</span>
              <span className="text-slate-300">Água</span>
            </div>
  
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Status</span>
              <span className="text-yellow-300">Rascunho</span>
            </div>
  
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Cálculo</span>
              <span className="text-slate-300">Não executado</span>
            </div>
          </div>
        </div>
  
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Próximas propriedades
          </h3>
  
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
            <li>• Diâmetro do cano</li>
            <li>• Coeficiente K do acessório</li>
            <li>• Carga da bomba H_b</li>
            <li>• Vazão do sistema</li>
            <li>• Cota do reservatório</li>
          </ul>
        </div>
      </aside>
    );
  }