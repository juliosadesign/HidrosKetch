import type { User } from "@supabase/supabase-js";
import type { ProjectVisualState } from "../../editor/editor.types";
import type { ComponentCatalogItem } from "../../domain/catalogs/componentCatalog";
import { ConfirmCalculateButton } from "../toolbar/ConfirmCalculateButton";
import { QuickComponentSearch } from "./QuickComponentSearch";
import { SupabaseStatusBadge } from "../cloud/SupabaseStatusBadge";
import { UserMenu } from "../auth/UserMenu";

type CloudSaveStatus = "idle" | "saving" | "success" | "error";

type TopbarProps = {
  projectState: ProjectVisualState;
  onConfirmCalculate: () => void;
  onCreateSimpleNetwork: () => void;
  onAddComponent: (component: ComponentCatalogItem) => void;
  onSaveCloudProject: () => void;
  onOpenMyProjects: () => void;
  onAuthUserChange: (user: User | null) => void;
  cloudSaveStatus: CloudSaveStatus;
  cloudSaveMessage: string | null;
  isCloudUserLoggedIn: boolean;
  validationErrorCount: number;
};

function getStatusLabel(projectState: ProjectVisualState) {
  if (projectState === "calculated") return "Calculado";
  if (projectState === "outdated") return "Desatualizado";
  return "Rascunho";
}

function getStatusClass(projectState: ProjectVisualState) {
  if (projectState === "calculated") return "text-emerald-300";
  if (projectState === "outdated") return "text-yellow-300";
  return "text-slate-300";
}

function getCloudMessageClass(status: CloudSaveStatus) {
  if (status === "success") return "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
  if (status === "error") return "border-red-400/40 bg-red-500/10 text-red-100";
  if (status === "saving") return "border-cyan-400/40 bg-cyan-500/10 text-cyan-100";
  return "border-slate-700 bg-slate-900 text-slate-300";
}

export function Topbar({
  projectState,
  onConfirmCalculate,
  onCreateSimpleNetwork,
  onAddComponent,
  onSaveCloudProject,
  onOpenMyProjects,
  onAuthUserChange,
  cloudSaveStatus,
  cloudSaveMessage,
  isCloudUserLoggedIn,
  validationErrorCount,
}: TopbarProps) {
  const isSavingCloud = cloudSaveStatus === "saving";
  const canSaveCloud = isCloudUserLoggedIn && !isSavingCloud;

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-sm font-bold text-cyan-300">
            HS
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-wide text-white">
              HidroSketch
            </h1>
            <p className="truncate text-xs text-slate-400">
              Pré-dimensionamento visual de redes hidráulicas, bombas e energia
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            Status: <strong className={getStatusClass(projectState)}>{getStatusLabel(projectState)}</strong>
          </span>

          {validationErrorCount > 0 && (
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-red-300">
              Erros: {validationErrorCount}
            </span>
          )}

          <SupabaseStatusBadge />

          <UserMenu onUserChange={onAuthUserChange} />

          <button
            type="button"
            onClick={onOpenMyProjects}
            disabled={!isCloudUserLoggedIn}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
            title={
              isCloudUserLoggedIn
                ? "Lista os projetos salvos na sua conta Supabase."
                : "Entre na sua conta para acessar seus projetos salvos."
            }
          >
            Meus projetos
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={onSaveCloudProject}
              disabled={!canSaveCloud}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
              title={
                isCloudUserLoggedIn
                  ? "Salva o projeto atual na sua conta Supabase."
                  : "Entre na sua conta para salvar projetos na nuvem."
              }
            >
              {isSavingCloud ? "Salvando..." : "Salvar na nuvem"}
            </button>

            {cloudSaveMessage && (
              <div
                className={`absolute right-0 top-10 z-50 w-72 rounded-xl border p-3 text-xs shadow-xl ${getCloudMessageClass(cloudSaveStatus)}`}
              >
                {cloudSaveMessage}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCreateSimpleNetwork}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            title="Monta automaticamente um exemplo didático: reservatório, bomba, canos, joelho e tanque."
          >
            Montar rede simples
          </button>

          <ConfirmCalculateButton
            projectState={projectState}
            onConfirmCalculate={onConfirmCalculate}
          />
        </div>
      </div>

      <QuickComponentSearch onAddComponent={onAddComponent} />
    </header>
  );
}
