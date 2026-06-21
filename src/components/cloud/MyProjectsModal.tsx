import type { CloudProjectRecord } from "../../lib/cloudProjects";

type MyProjectsModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  projects: CloudProjectRecord[];
  onClose: () => void;
  onRefresh: () => void;
  onOpenProject: (project: CloudProjectRecord) => void;
};

function formatDate(value: string | null) {
  if (!value) return "nÃ£o informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data invÃ¡lida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function MyProjectsModal({
  isOpen,
  isLoading,
  errorMessage,
  projects,
  onClose,
  onRefresh,
  onOpenProject,
}: MyProjectsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-cyan-950/40">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Nuvem HidroSketch
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Meus projetos</h2>
            <p className="mt-1 text-sm text-slate-400">
              Abra projetos salvos na sua conta Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Atualizando..." : "Atualizar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
              aria-label="Fechar meus projetos"
            >
              Ã—
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </div>
          )}

          {isLoading && (
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              Carregando projetos salvos...
            </div>
          )}

          {!isLoading && projects.length === 0 && !errorMessage && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-6 text-sm text-slate-300">
              <p className="font-semibold text-white">Nenhum projeto salvo ainda.</p>
              <p className="mt-2 text-slate-400">
                Monte uma rede, faÃ§a login e use o botÃ£o â€œSalvar na nuvemâ€ para criar o primeiro projeto.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 transition hover:border-cyan-400/50 hover:bg-slate-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-white">
                      {project.name || "Projeto sem tÃ­tulo"}
                    </h3>
                    {project.description && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {project.description}
                      </p>
                    )}
                    <dl className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-slate-300">Criado em</dt>
                        <dd>{formatDate(project.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-300">Ãšltima atualizaÃ§Ã£o</dt>
                        <dd>{formatDate(project.updatedAt)}</dd>
                      </div>
                    </dl>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenProject(project)}
                    className="shrink-0 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Abrir projeto
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">
          Os projetos listados respeitam as regras de seguranÃ§a do Supabase e pertencem Ã  conta logada.
        </div>
      </div>
    </div>
  );
}


