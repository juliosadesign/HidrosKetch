// Barra inferior de status.
// Ela informa o estado atual do projeto.
// Nesta Sprint, os valores ainda são fixos.

export function BottomStatusBar() {
    return (
      <footer className="flex h-10 items-center justify-between border-t border-slate-800 bg-slate-900 px-4 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Status: <strong className="text-yellow-300">Rascunho</strong>
          </span>
  
          <span>Erros: 0</span>
          <span>Alertas: 0</span>
          <span>Escala: não configurada</span>
        </div>
  
        <div className="flex items-center gap-4">
          <span>Modo: Sprint 1 — Layout base</span>
          <span>Cálculo: aguardando implementação</span>
        </div>
      </footer>
    );
  }