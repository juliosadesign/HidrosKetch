// Barra superior do sistema.
// Nesta Sprint, os botões ainda são visuais.
// As ações reais entram nas próximas sprints.

export function Topbar() {
    return (
      <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
            HS
          </div>
  
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">
              HidroSketch
            </h1>
            <p className="text-xs text-slate-400">
              Editor hidráulico CAD-lite — Sprint 1
            </p>
          </div>
        </div>
  
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
            Novo
          </button>
  
          <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
            Salvar
          </button>
  
          <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
            Exportar
          </button>
  
          <button
            disabled
            className="rounded-lg bg-cyan-500/40 px-4 py-1.5 text-xs font-semibold text-cyan-950 opacity-60"
          >
            Confirmar e recalcular
          </button>
        </div>
      </header>
    );
  }