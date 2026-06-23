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

function getLocalFileMessageClass(status: LocalProjectFileStatus) {
  if (status === "success") return "border-emerald-400/40 bg-emerald-500/10 text-emerald-100";
  if (status === "error") return "border-red-400/40 bg-red-500/10 text-red-100";
  return "border-slate-700 bg-slate-900 text-slate-300";
}

function CompactButton({
  label,
  title,
  onClick,
  disabled = false,
  tone = "default",
}: {
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "cyan" | "green" | "yellow" | "violet";
}) {
  const toneClass = {
    default: "border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-100",
    cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20",
    green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20",
    yellow: "border-yellow-400/60 bg-yellow-400 text-slate-950 hover:bg-yellow-300",
    violet: "border-violet-500/40 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500 ${toneClass}`}
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

    if (file) onImportLocalProject(file);
    event.target.value = "";
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/95">
      <div className="flex min-h-14 items-center gap-2 px-3 py-2">
        <div className="flex min-w-[150px] shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-[11px] font-bold text-cyan-300">
            HS
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-wide text-white">HidroSketch</h1>
            <p className="truncate text-[11px] text-slate-500">Redes hidraulicas</p>
          </div>
        </div>

        <label className="hidden min-w-[190px] max-w-xs items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 lg:flex">
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

        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto pb-1">
          <span className="hidden whitespace-nowrap rounded-full border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 xl:inline-flex">
            Status: <strong className={getStatusClass(projectState)}>{getStatusLabel(projectState)}</strong>
          </span>

          {validationErrorCount > 0 && (
            <span className="whitespace-nowrap rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-300">
              Erros: {validationErrorCount}
            </span>
          )}

          <div className="hidden xl:block"><SupabaseStatusBadge /></div>
          <UserMenu onUserChange={onAuthUserChange} />

          <CompactButton label="Novo" title="Cria um projeto vazio." onClick={onCreateEmptyProject} />
          <CompactButton label="Abrir" title="Abre arquivo .hidrosketch.json." onClick={handleSelectLocalFile} />
          <CompactButton label="Baixar" title="Baixa o projeto atual." onClick={onDownloadLocalProject} tone="cyan" />
          <CompactButton
            label="Arquivos"
            title={isCloudUserLoggedIn ? "Abre seus projetos na nuvem." : "Entre para acessar seus projetos."}
            onClick={onOpenMyProjects}
            disabled={!isCloudUserLoggedIn}
            tone="cyan"
          />
          <CompactButton
            label={isSavingCloud ? "Salvando..." : "Nuvem"}
            title={isCloudUserLoggedIn ? "Salva o projeto na nuvem." : "Entre para salvar na nuvem."}
            onClick={onSaveCloudProject}
            disabled={!canSaveCloud}
            tone="green"
          />
          <CompactButton label="Rede" title="Monta uma rede simples." onClick={onCreateSimpleNetwork} tone="cyan" />
          <CompactButton label="Rede+" title="Monta uma rede completa." onClick={onCreateCompleteNetwork} tone="green" />
          <CompactButton
            label="Relatorio"
            title={hasCalculationResult ? "Abre o relatorio tecnico visual." : "Recalcule antes de abrir o relatorio."}
            onClick={onOpenTechnicalReport}
            disabled={!hasCalculationResult}
            tone="violet"
          />
          <CompactButton
            label="CSV"
            title={hasCalculationResult ? "Exporta CSV tecnico." : "Recalcule antes de exportar CSV."}
            onClick={onExportCsv}
            disabled={!hasCalculationResult}
            tone="cyan"
          />
          <CompactButton
            label="PDF"
            title={hasCalculationResult ? "Abre janela para salvar como PDF." : "Recalcule antes de gerar PDF."}
            onClick={onExportPdf}
            disabled={!hasCalculationResult}
            tone="default"
          />
          <ConfirmCalculateButton projectState={projectState} onConfirmCalculate={onConfirmCalculate} />
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
            <div className={`rounded-xl border p-3 text-xs shadow-xl ${getLocalFileMessageClass(localProjectFileStatus)}`}>
              {localProjectFileMessage}
            </div>
          )}
          {cloudSaveMessage && (
            <div className={`rounded-xl border p-3 text-xs shadow-xl ${getCloudMessageClass(cloudSaveStatus)}`}>
              {cloudSaveMessage}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
