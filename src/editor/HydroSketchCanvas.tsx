// Prancheta central do HidroSketch.
// Nesta Sprint, ela ainda não tem React Flow.
// O objetivo agora é apenas criar a área visual onde o editor será implementado.

export function HydroSketchCanvas() {
    return (
      <section className="relative min-h-0 overflow-hidden bg-slate-950">
        {/* Fundo com aparência de grade técnica */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:32px_32px]" />
  
        {/* Camada escura para reduzir agressividade da grade */}
        <div className="absolute inset-0 bg-slate-950/40" />
  
        {/* Conteúdo inicial da prancheta */}
        <div className="relative flex h-full items-center justify-center p-8">
          <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Prancheta CAD-lite
            </p>
  
            <h2 className="mt-3 text-2xl font-bold text-white">
              Área de montagem hidráulica
            </h2>
  
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Aqui ficará o editor visual do HidroSketch. Nas próximas sprints,
              esta área receberá componentes arrastáveis, conexão por pontos,
              grade, régua, escala real e seleção de objetos.
            </p>
  
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                Grade
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                Régua
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                Escala real
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }