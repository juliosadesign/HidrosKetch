import { useRef } from "react";
import type { ChangeEvent } from "react";
import type { User } from "@supabase/supabase-js";
import type { ProjectVisualState } from "../../editor/editor.types";
import type { ComponentCatalogItem } from "../../domain/catalogs/componentCatalog";
import { ConfirmCalculateButton } from "../toolbar/ConfirmCalculateButton";
import { QuickComponentSearch } from "./QuickComponentSearch";
import { SupabaseStatusBadge } from "../cloud/SupabaseStatusBadge";
import { UserMenu } from "../auth/UserMenu";

type CloudSaveStatus = "idle" | "saving" | "success" | "error";
type LocalProjectFileStatus = "idle" | "success" | "error";

type TopbarProps = {
  projectName: string;
  projectState: ProjectVisualState;
  onProjectNameChange: (name: string) => void;
  onCreateEmptyProject: () => void;
  onDownloadLocalProject: () => void;
  onImportLocalProject: (file: File) => void;
  localProjectFileStatus: LocalProjectFileStatus;
  localProjectFileMessage: string | null;
  onConfirmCalculate: () => void;
  onCreateSimpleNetwork: () => void;
  onCreateCompleteNetwork: () => void;
  onAddComponent: (component: ComponentCatalogItem) => void;
  onSaveCloudProject: () => void;
  onOpenMyProjects: () => void;
  onOpenTechnicalReport: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onAuthUserChange: (user: User | null) => void;
  cloudSaveStatus: CloudSaveStatus;
  cloudSaveMessage: string | null;
  isCloudUserLoggedIn: boolean;
  validationErrorCount: number;
  hasCalculationResult: boolean;
};

const neutralButtonClass =
  "rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-100";

const cyanButtonClass =
  "rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-500/20";

const greenButtonClass =
  "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-100 transition hover:bg-emerald-500/20";

const disabledButtonClass =
  "disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500";

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
  if (status === "success") {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
  }

  if (status === "error") {
    return "border-red-400/40 bg-red-500/10 text-red-100";
  }

  if (status === "saving") {
    return "border-cyan-400/40 bg-cyan-500/10 text-cyan-100";
  }

  return "border-slate-700 bg-slate-900 text-slate-300";
}

function getLocalFileMessageClass(status: LocalProjectFileStatus) {
  if (status === "success") {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
  }

  if (status === "error") {
    return "border-red-400/40 bg-red-500/10 text-red-100";
  }

  return "border-slate-700 bg-slate-900 text-slate-300";
}

function TopbarButton({
  label,
  title,
  onClick,
  disabled = false,
  variant = "cyan",
}: {
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "neutral" | "cyan" | "green" | "violet" | "amber";
}) {
  const variantClass = {
    neutral: neutralButtonClass,
    cyan: cyanButtonClass,
    green: greenButtonClass,
    violet:
      "rounded-lg border border-violet-500/40 bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-violet-100 transition hover:bg-violet-500/20",
    amber:
      "rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-500/20",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${variantClass} ${disabledButtonClass}`}
      title={title}
    >
      {label}
    </button>
  );
}

export function Topbar({
  projectName,
  projectState,
  onProjectNameChange,
  onCreateEmptyProject,
  onDownloadLocalProject,
  onImportLocalProject,
  localProjectFileStatus,
  localProjectFileMessage,
  onConfirmCalculate,
  onCreateSimpleNetwork,
  onCreateCompleteNetwork,
  onAddComponent,
  onSaveCloudProject,
  onOpenMyProjects,
  onOpenTechnicalReport,
  onExportCsv,
  onExportPdf,
  onAuthUserChange,
  cloudSaveStatus,
  cloudSaveMessage,
  isCloudUserLoggedIn,
  validationErrorCount,
  hasCalculationResult,
}: TopbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isSavingCloud = cloudSaveStatus === "saving";
  const canSaveCloud = isCloudUserLoggedIn && !isSavingCloud;

  function handleSelectLocalFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onImportLocalProject(file);
    }

    event.target.value = "";
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/95">
      <div className="flex min-h-14 items-center gap-2 px-3 py-2">
        <div className="flex min-w-[155px] shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-xs font-bold text-cyan-300">
            HS
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-wide text-white">
              HidroSketch
            </h1>
            <p className="truncate text-[11px] text-slate-500">
              Redes hidraulicas
            </p>
          </div>
        </div>

        <label className="hidden min-w-[180px] max-w-[250px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 lg:flex">
          <span className="shrink-0 font-semibold text-cyan-200">Projeto</span>
          <input
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-slate-600"
            placeholder="Nome do projeto"
            aria-label="Nome do projeto"
          />
        </label>

        <div className="min-w-[220px] flex-1">
          <QuickComponentSearch compact onAddComponent={onAddComponent} />
        </div>

        <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
          <span className="hidden whitespace-nowrap rounded-full border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 xl:inline-flex">
            Status:
            <strong className={`ml-1 ${getStatusClass(projectState)}`}>
              {getStatusLabel(projectState)}
            </strong>
          </span>

          {validationErrorCount > 0 && (
            <span className="whitespace-nowrap rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-300">
              Erros: {validationErrorCount}
            </span>
          )}

          <div className="hidden xl:block">
            <SupabaseStatusBadge />
          </div>

          <UserMenu onUserChange={onAuthUserChange} />

          <TopbarButton
            label="Novo"
            variant="neutral"
            onClick={onCreateEmptyProject}
            title="Cria um projeto vazio para comecar do zero."
          />

          <TopbarButton
            label="Abrir"
            variant="neutral"
            onClick={handleSelectLocalFile}
            title="Abre um arquivo .hidrosketch.json salvo no computador."
          />

          <TopbarButton
            label="Baixar"
            variant="cyan"
            onClick={onDownloadLocalProject}
            title="Baixa o projeto atual como arquivo local .hidrosketch.json."
          />

          <TopbarButton
            label="Arquivos"
            variant="cyan"
            onClick={onOpenMyProjects}
            disabled={!isCloudUserLoggedIn}
            title={
              isCloudUserLoggedIn
                ? "Abre seus arquivos e projetos salvos na nuvem."
                : "Entre na sua conta para acessar seus projetos salvos."
            }
          />

          <TopbarButton
            label={isSavingCloud ? "Salvando..." : "Nuvem"}
            variant="green"
            onClick={onSaveCloudProject}
            disabled={!canSaveCloud}
            title={
              isCloudUserLoggedIn
                ? "Salva o projeto atual na sua conta Supabase."
                : "Entre na sua conta para salvar projetos na nuvem."
            }
          />

          <TopbarButton
            label="Rede"
            variant="cyan"
            onClick={onCreateSimpleNetwork}
            title="Monta automaticamente um exemplo didatico simples."
          />

          <TopbarButton
            label="Rede+"
            variant="cyan"
            onClick={onCreateCompleteNetwork}
            title="Monta uma rede demonstrativa maior, com ramais e instrumentos."
          />

          <TopbarButton
            label="Relatorio"
            variant="violet"
            onClick={onOpenTechnicalReport}
            disabled={!hasCalculationResult}
            title={
              hasCalculationResult
                ? "Abre o relatorio tecnico visual."
                : "Recalcule antes de abrir o relatorio tecnico."
            }
          />

          <TopbarButton
            label="CSV"
            variant="cyan"
            onClick={onExportCsv}
            disabled={!hasCalculationResult}
            title={
              hasCalculationResult
                ? "Exporta o resultado tecnico em CSV."
                : "Recalcule antes de exportar CSV."
            }
          />

          <TopbarButton
            label="PDF"
            variant="amber"
            onClick={onExportPdf}
            disabled={!hasCalculationResult}
            title={
              hasCalculationResult
                ? "Abre o relatorio para salvar como PDF."
                : "Recalcule antes de gerar PDF."
            }
          />

          <ConfirmCalculateButton
            projectState={projectState}
            onConfirmCalculate={onConfirmCalculate}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.hidrosketch.json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {(localProjectFileMessage || cloudSaveMessage) && (
        <div className="fixed right-4 top-16 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
          {localProjectFileMessage && (
            <div
              className={`rounded-xl border p-3 text-xs shadow-xl ${getLocalFileMessageClass(localProjectFileStatus)}`}
            >
              {localProjectFileMessage}
            </div>
          )}

          {cloudSaveMessage && (
            <div
              className={`rounded-xl border p-3 text-xs shadow-xl ${getCloudMessageClass(cloudSaveStatus)}`}
            >
              {cloudSaveMessage}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

