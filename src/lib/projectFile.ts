import type {
  HydroFlowEdge,
  HydroFlowNode,
  ProjectEnergySettings,
  ProjectVisualState,
} from "../editor/editor.types";
import type { StoredCalculationState } from "../store/resultStore";

export const LOCAL_PROJECT_FORMAT = "hidrosketch-local-project";
export const LOCAL_PROJECT_FORMAT_VERSION = "1.0";

type ScaleSettings = {
  pixelsPerMeter: number;
  gridSpacingPx: number;
  gridEnabled: boolean;
  rulerEnabled: boolean;
  snapEnabled: boolean;
};

export type BuildLocalProjectFileInput = {
  projectName: string;
  nodes: HydroFlowNode[];
  edges: HydroFlowEdge[];
  scaleSettings: ScaleSettings;
  energySettings: ProjectEnergySettings;
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
  cloudProjectId: string | null;
};

export type LocalHydroSketchProjectFile = {
  format: typeof LOCAL_PROJECT_FORMAT;
  formatVersion: typeof LOCAL_PROJECT_FORMAT_VERSION;
  name: string;
  exportedAt: string;
  cloudProjectId: string | null;
  editor: {
    nodes: HydroFlowNode[];
    edges: HydroFlowEdge[];
  };
  settings: {
    scale: ScaleSettings;
    energy: ProjectEnergySettings;
  };
  status: {
    projectState: ProjectVisualState;
    calculationStatus: StoredCalculationState["status"];
    lastCalculatedAt: string | null;
  };
  calculation: {
    lastResult: StoredCalculationState["lastResult"];
    lastValidation: StoredCalculationState["lastValidation"];
  };
};

export type ImportedHydroSketchProject = {
  name: string;
  nodes: HydroFlowNode[];
  edges: HydroFlowEdge[];
  scaleSettings?: Partial<ScaleSettings>;
  energySettings?: Partial<ProjectEnergySettings>;
  projectState: ProjectVisualState;
  calculationState: StoredCalculationState;
  sourceCloudProjectId: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProjectVisualState(value: unknown): value is ProjectVisualState {
  return value === "draft" || value === "outdated" || value === "calculated";
}

function isCalculationStatus(
  value: unknown
): value is StoredCalculationState["status"] {
  return (
    value === "idle" ||
    value === "blocked" ||
    value === "success" ||
    value === "failed"
  );
}

function getSafeProjectName(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Projeto sem título";
}

function sanitizeFileName(name: string) {
  const withoutAccents = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const sanitized = withoutAccents
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);

  return sanitized || "projeto-hidrosketch";
}

export function buildLocalProjectFile(
  input: BuildLocalProjectFileInput
): LocalHydroSketchProjectFile {
  return {
    format: LOCAL_PROJECT_FORMAT,
    formatVersion: LOCAL_PROJECT_FORMAT_VERSION,
    name: getSafeProjectName(input.projectName),
    exportedAt: new Date().toISOString(),
    cloudProjectId: input.cloudProjectId,
    editor: {
      nodes: input.nodes,
      edges: input.edges,
    },
    settings: {
      scale: input.scaleSettings,
      energy: input.energySettings,
    },
    status: {
      projectState: input.projectState,
      calculationStatus: input.calculationState.status,
      lastCalculatedAt: input.calculationState.lastCalculatedAt,
    },
    calculation: {
      lastResult: input.calculationState.lastResult,
      lastValidation: input.calculationState.lastValidation,
    },
  };
}

export function downloadHydroSketchProjectFile(
  projectFile: LocalHydroSketchProjectFile
) {
  const fileName = `${sanitizeFileName(projectFile.name)}.hidrosketch.json`;
  const json = JSON.stringify(projectFile, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function readHydroSketchProjectFile(
  file: File
): Promise<ImportedHydroSketchProject> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Arquivo inválido ou incompatível. O conteúdo não é um JSON válido.");
  }

  if (!isRecord(parsed)) {
    throw new Error("Arquivo inválido ou incompatível com o HidroSketch.");
  }

  const format = parsed.format;
  const acceptsKnownFormat =
    format === LOCAL_PROJECT_FORMAT || format === "hidrosketch-cloud-project";
  const hasEditorShape = isRecord(parsed.editor);

  if (!acceptsKnownFormat && !hasEditorShape) {
    throw new Error("Arquivo inválido ou incompatível com o HidroSketch.");
  }

  const editor = isRecord(parsed.editor) ? parsed.editor : null;

  if (!editor || !Array.isArray(editor.nodes) || !Array.isArray(editor.edges)) {
    throw new Error(
      "Arquivo incompatível: componentes ou conexões não foram encontrados."
    );
  }

  const settings = isRecord(parsed.settings) ? parsed.settings : {};
  const status = isRecord(parsed.status) ? parsed.status : {};
  const calculation = isRecord(parsed.calculation) ? parsed.calculation : {};

  const savedProjectState = status.projectState;
  const savedCalculationStatus = status.calculationStatus;
  const lastCalculatedAt = status.lastCalculatedAt;

  return {
    name:
      typeof parsed.name === "string" && parsed.name.trim().length > 0
        ? parsed.name
        : "Projeto importado",
    nodes: editor.nodes as HydroFlowNode[],
    edges: editor.edges as HydroFlowEdge[],
    scaleSettings: isRecord(settings.scale)
      ? (settings.scale as Partial<ScaleSettings>)
      : undefined,
    energySettings: isRecord(settings.energy)
      ? (settings.energy as Partial<ProjectEnergySettings>)
      : undefined,
    projectState: isProjectVisualState(savedProjectState)
      ? savedProjectState
      : "outdated",
    calculationState: {
      status: isCalculationStatus(savedCalculationStatus)
        ? savedCalculationStatus
        : "idle",
      lastResult:
        "lastResult" in calculation
          ? (calculation.lastResult as StoredCalculationState["lastResult"])
          : null,
      lastValidation:
        "lastValidation" in calculation
          ? (calculation.lastValidation as StoredCalculationState["lastValidation"])
          : null,
      lastCalculatedAt: typeof lastCalculatedAt === "string" ? lastCalculatedAt : null,
    },
    sourceCloudProjectId:
      typeof parsed.cloudProjectId === "string" ? parsed.cloudProjectId : null,
  };
}
