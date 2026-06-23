import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useEdgesState, useNodesState } from "@xyflow/react";

import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { BottomStatusBar } from "./BottomStatusBar";
import { HydroSketchCanvas } from "../../editor/HydroSketchCanvas";
import { RightWorkspacePanel } from "../panels/RightWorkspacePanel";
import { MyProjectsModal } from "../cloud/MyProjectsModal";

import type { ComponentCatalogItem } from "../../domain/catalogs/componentCatalog";
import type {
  AddComponentRequest,
  HydroFlowEdge,
  HydroFlowNode,
  ProjectEnergySettings,
  ProjectVisualState,
  UpdateNodeDataOptions,
} from "../../editor/editor.types";

import {
  EMPTY_RESULT_STORE,
  type StoredCalculationState,
} from "../../store/resultStore";

import { buildCalculationResultFromEditor } from "../../engine/reports/buildCalculationResult";
import { downloadCalculationCsv } from "../../engine/exportCsv";
import { createSimpleHydraulicNetworkTemplate } from "../../editor/templates/simpleNetworkTemplate";
import { createCompleteHydraulicNetworkTemplate } from "../../editor/templates/completeNetworkTemplate";
import {
  listUserCloudProjects,
  saveProjectToCloud,
  type CloudProjectRecord,
} from "../../lib/cloudProjects";
import {
  buildLocalProjectFile,
  downloadHydroSketchProjectFile,
  readHydroSketchProjectFile,
} from "../../lib/projectFile";
import { supabase } from "../../lib/supabaseClient";
import { openTechnicalReportPdfPrint } from "../../lib/exportPdf";
import type { Json } from "../../types/supabase.types";

const initialNodes: HydroFlowNode[] = [];
const initialEdges: HydroFlowEdge[] = [];

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_DEFAULT_WIDTH = 280;
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 420;
const RIGHT_PANEL_COLLAPSED_WIDTH = 52;
const RIGHT_PANEL_DEFAULT_WIDTH = 360;
const RIGHT_PANEL_MIN_WIDTH = 300;
const RIGHT_PANEL_MAX_WIDTH = 520;

const CLOUD_PROJECT_FORMAT_VERSION = "1.0";

type CloudSaveState = {
  status: "idle" | "saving" | "success" | "error";
  message: string | null;
};

type LocalProjectFileState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

type CloudProjectJsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is CloudProjectJsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProjectVisualState(value: unknown): value is ProjectVisualState {
  return value === "draft" || value === "outdated" || value === "calculated";
}

function isCalculationStateStatus(
  value: unknown
): value is StoredCalculationState["status"] {
  return (
    value === "idle" ||
    value === "blocked" ||
    value === "success" ||
    value === "failed"
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function AppLayout() {
  const requestCounterRef = useRef(0);

  const [addRequest, setAddRequest] = useState<AddComponentRequest | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT_WIDTH);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<HydroFlowNode>(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<HydroFlowEdge>(initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [projectState, setProjectState] =
    useState<ProjectVisualState>("draft");

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [cloudProjectId, setCloudProjectId] = useState<string | null>(null);
  const [cloudVersionNumber, setCloudVersionNumber] = useState(0);
  const [cloudSaveState, setCloudSaveState] = useState<CloudSaveState>({
    status: "idle",
    message: null,
  });
  const [isMyProjectsOpen, setIsMyProjectsOpen] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<CloudProjectRecord[]>([]);
  const [isLoadingCloudProjects, setIsLoadingCloudProjects] = useState(false);
  const [cloudProjectsError, setCloudProjectsError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Projeto HidroSketch");
  const [localProjectFileState, setLocalProjectFileState] =
    useState<LocalProjectFileState>({
      status: "idle",
      message: null,
    });

  const [scaleSettings, setScaleSettings] = useState({
    pixelsPerMeter: 40,
    gridSpacingPx: 20,
    gridEnabled: true,
    rulerEnabled: false,
    snapEnabled: true,
  });

  const [energySettings, setEnergySettings] = useState<ProjectEnergySettings>({
    flowInputMode: "flow",
    defaultFlowLps: 2,
    inletVelocityMs: 1,
    referenceDiameterMm: 50,
    originElevationM: 0,
    destinationElevationM: 0,
    requiredOutletPressureKpa: 0,
    operationHoursPerDay: 2,
    operationDaysPerMonth: 30,
    energyTariffBRLKwh: 0.9,
  });

  function updateScaleSettings(updates: Partial<typeof scaleSettings>) {
    setScaleSettings((current) => ({
      ...current,
      ...updates,
    }));

    setProjectState("outdated");
  }

  function updateEnergySettings(updates: Partial<ProjectEnergySettings>) {
    setEnergySettings((current) => ({
      ...current,
      ...updates,
    }));

    setProjectState("outdated");
  }

  const [calculationState, setCalculationState] =
    useState<StoredCalculationState>(EMPTY_RESULT_STORE);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const validationErrorCount =
    calculationState.lastValidation?.errors.length ?? 0;

  const leftColumnWidth = isSidebarOpen
    ? sidebarWidth
    : SIDEBAR_COLLAPSED_WIDTH;
  const rightColumnWidth = isRightPanelOpen
    ? rightPanelWidth
    : RIGHT_PANEL_COLLAPSED_WIDTH;

  function handleStartSidebarResize(
    event: ReactMouseEvent<HTMLDivElement>
  ) {
    startPanelResize(event, sidebarWidth);
  }

  function handleStartRightPanelResize(
    event: ReactMouseEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = rightPanelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handleMouseMove(moveEvent: MouseEvent) {
      const delta = startX - moveEvent.clientX;
      setRightPanelWidth(
        clamp(startWidth + delta, RIGHT_PANEL_MIN_WIDTH, RIGHT_PANEL_MAX_WIDTH)
      );
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function startPanelResize(
    event: ReactMouseEvent<HTMLDivElement>,
    startWidth: number
  ) {
    event.preventDefault();

    const startX = event.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handleMouseMove(moveEvent: MouseEvent) {
      const delta = moveEvent.clientX - startX;

      setSidebarWidth(
        clamp(startWidth + delta, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH)
      );
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleAddComponent(component: ComponentCatalogItem) {
    requestCounterRef.current += 1;

    setAddRequest({
      requestId: requestCounterRef.current,
      component,
    });
  }

  function updateSelectedNodeData(
    updates: Record<string, unknown>,
    options?: UpdateNodeDataOptions
  ) {
    if (!selectedNodeId) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id !== selectedNodeId) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            label: options?.label ?? node.data.label,
            defaultData: {
              ...node.data.defaultData,
              ...updates,
            },
          },
        };
      })
    );

    setProjectState("outdated");
  }

  function handleCreateSimpleNetwork() {
    const template = createSimpleHydraulicNetworkTemplate();

    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setCalculationState(EMPTY_RESULT_STORE);
    setProjectState("outdated");
    setProjectName("Rede simples HidroSketch");
    setCloudProjectId(null);
    setCloudVersionNumber(0);
    setCloudSaveState({
      status: "idle",
      message: null,
    });
    setLocalProjectFileState({
      status: "success",
      message: "Rede simples criada. Renomeie ou baixe o projeto quando quiser.",
    });

    setEnergySettings((current) => ({
      ...current,
      flowInputMode: "flow",
      defaultFlowLps: 2,
      inletVelocityMs: 1,
      referenceDiameterMm: 50,
      originElevationM: 0,
      destinationElevationM: 10,
      requiredOutletPressureKpa: 50,
      operationHoursPerDay: 2,
      operationDaysPerMonth: 30,
      energyTariffBRLKwh: 0.9,
    }));
  }


  function handleCreateCompleteNetwork() {
    const hasCurrentProject = nodes.length > 0 || edges.length > 0;

    if (
      hasCurrentProject &&
      !window.confirm(
        "Montar a rede completa demonstrativa? A rede atual sera substituida."
      )
    ) {
      return;
    }

    const template = createCompleteHydraulicNetworkTemplate();

    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setCalculationState(EMPTY_RESULT_STORE);
    setProjectState("outdated");
    setProjectName("Rede demonstrativa completa");
    setCloudProjectId(null);
    setCloudVersionNumber(0);
    setCloudSaveState({
      status: "idle",
      message: null,
    });
    setLocalProjectFileState({
      status: "success",
      message: "Rede completa criada. Recalcule para atualizar os resultados.",
    });

    setEnergySettings((current) => ({
      ...current,
      flowInputMode: "flow",
      defaultFlowLps: 2.4,
      inletVelocityMs: 1.1,
      referenceDiameterMm: 50,
      originElevationM: 0,
      destinationElevationM: 12,
      requiredOutletPressureKpa: 50,
      operationHoursPerDay: 4,
      operationDaysPerMonth: 30,
      energyTariffBRLKwh: 0.9,
    }));
  }

  function handleRenameProject(name: string) {
    setProjectName(name);
    setProjectState((current) =>
      current === "calculated" ? "outdated" : current
    );
  }

  function handleCreateEmptyProject() {
    const hasCurrentProject = nodes.length > 0 || edges.length > 0;

    if (
      hasCurrentProject &&
      !window.confirm(
        "Criar um novo projeto vazio? As alteracoes nao baixadas podem ser perdidas."
      )
    ) {
      return;
    }

    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setCalculationState(EMPTY_RESULT_STORE);
    setProjectState("draft");
    setProjectName("Projeto sem titulo");
    setCloudProjectId(null);
    setCloudVersionNumber(0);
    setCloudSaveState({
      status: "idle",
      message: null,
    });
    setLocalProjectFileState({
      status: "success",
      message: "Novo projeto criado.",
    });
  }

  function handleDownloadLocalProject() {
    const projectFile = buildLocalProjectFile({
      projectName,
      nodes,
      edges,
      scaleSettings,
      energySettings,
      projectState,
      calculationState,
      cloudProjectId,
    });

    downloadHydroSketchProjectFile(projectFile);
    setLocalProjectFileState({
      status: "success",
      message: "Projeto baixado com sucesso.",
    });
  }

  async function handleImportLocalProject(file: File) {
    try {
      const importedProject = await readHydroSketchProjectFile(file);

      setNodes(importedProject.nodes);
      setEdges(importedProject.edges);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setProjectName(importedProject.name);

      if (importedProject.scaleSettings) {
        setScaleSettings((current) => ({
          ...current,
          ...importedProject.scaleSettings,
        }));
      }

      if (importedProject.energySettings) {
        setEnergySettings((current) => ({
          ...current,
          ...importedProject.energySettings,
        }));
      }

      setCalculationState(importedProject.calculationState);
      setProjectState(
        importedProject.projectState === "calculated" ? "outdated" : importedProject.projectState
      );
      setCloudProjectId(null);
      setCloudVersionNumber(0);
      setCloudSaveState({
        status: "idle",
        message: null,
      });
      setLocalProjectFileState({
        status: "success",
        message:
          importedProject.sourceCloudProjectId === null
            ? "Projeto carregado com sucesso."
            : "Projeto carregado com sucesso. Salve na nuvem para vincular a sua conta atual.",
      });
    } catch (error) {
      setLocalProjectFileState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Arquivo invalido ou incompativel.",
      });
    }
  }

  async function handleSaveCloudProject() {
    if (!supabase) {
      setCloudSaveState({
        status: "error",
        message: "Configure o Supabase antes de salvar na nuvem.",
      });
      return;
    }

    setCloudSaveState({
      status: "saving",
      message: "Salvando projeto na nuvem...",
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;

    if (userError || !user) {
      setCloudSaveState({
        status: "error",
        message: "Entre na sua conta para salvar projetos na nuvem.",
      });
      setAuthUser(null);
      return;
    }

    setAuthUser(user);

    const savedAt = new Date().toISOString();
    const projectJson = {
      format: "hidrosketch-cloud-project",
      formatVersion: CLOUD_PROJECT_FORMAT_VERSION,
      name: projectName,
      savedAt,
      editor: {
        nodes,
        edges,
      },
      settings: {
        scale: scaleSettings,
        energy: energySettings,
      },
      status: {
        projectState,
        calculationStatus: calculationState.status,
        lastCalculatedAt: calculationState.lastCalculatedAt,
      },
      calculation: {
        lastResult: calculationState.lastResult,
        lastValidation: calculationState.lastValidation,
      },
    } as unknown as Json;

    const saveResult = await saveProjectToCloud({
      userId: user.id,
      projectId: cloudProjectId,
      name: projectName,
      description:
        "Projeto salvo pelo HidroSketch com componentes, conexoes e configuracoes tecnicas.",
      projectJson,
      versionNumber: cloudVersionNumber + 1,
    });

    if (!saveResult.ok) {
      setCloudSaveState({
        status: "error",
        message: saveResult.message,
      });
      return;
    }

    setCloudProjectId(saveResult.projectId);
    setCloudVersionNumber(saveResult.versionNumber);
    setCloudSaveState({
      status: "success",
      message: saveResult.message,
    });
  }



  async function handleOpenMyProjects() {
    if (!authUser) {
      setCloudSaveState({
        status: "error",
        message: "Entre na sua conta para acessar seus projetos salvos.",
      });
      return;
    }

    setIsMyProjectsOpen(true);
    await handleRefreshCloudProjects(authUser.id);
  }

  async function handleRefreshCloudProjects(userId = authUser?.id) {
    if (!userId) {
      setCloudProjectsError("Entre na sua conta para listar seus projetos.");
      return;
    }

    setIsLoadingCloudProjects(true);
    setCloudProjectsError(null);

    const listResult = await listUserCloudProjects(userId);

    if (!listResult.ok) {
      setCloudProjects([]);
      setCloudProjectsError(listResult.message);
      setIsLoadingCloudProjects(false);
      return;
    }

    setCloudProjects(listResult.projects);
    setIsLoadingCloudProjects(false);
  }

  function handleOpenCloudProject(project: CloudProjectRecord) {
    const projectJson = project.projectJson as unknown;

    if (!isRecord(projectJson) || !isRecord(projectJson.editor)) {
      setCloudProjectsError(
        "Este projeto nao possui dados validos para abrir no editor."
      );
      return;
    }

    const editor = projectJson.editor;

    if (!Array.isArray(editor.nodes) || !Array.isArray(editor.edges)) {
      setCloudProjectsError(
        "Este projeto nao contem componentes e conexoes em formato valido."
      );
      return;
    }

    setNodes(editor.nodes as HydroFlowNode[]);
    setEdges(editor.edges as HydroFlowEdge[]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);

    if (isRecord(projectJson.settings)) {
      const settings = projectJson.settings;

      if (isRecord(settings.scale)) {
        setScaleSettings((current) => ({
          ...current,
          ...(settings.scale as Partial<typeof current>),
        }));
      }

      if (isRecord(settings.energy)) {
        setEnergySettings((current) => ({
          ...current,
          ...(settings.energy as Partial<ProjectEnergySettings>),
        }));
      }
    }

    if (isRecord(projectJson.status)) {
      const savedProjectState = projectJson.status.projectState;
      const savedCalculationStatus = projectJson.status.calculationStatus;
      const savedLastCalculatedAt = projectJson.status.lastCalculatedAt;

      setProjectState(
        isProjectVisualState(savedProjectState) ? savedProjectState : "outdated"
      );

      setCalculationState({
        status: isCalculationStateStatus(savedCalculationStatus)
          ? savedCalculationStatus
          : "idle",
        lastResult:
          isRecord(projectJson.calculation) && "lastResult" in projectJson.calculation
            ? (projectJson.calculation.lastResult as StoredCalculationState["lastResult"])
            : null,
        lastValidation:
          isRecord(projectJson.calculation) && "lastValidation" in projectJson.calculation
            ? (projectJson.calculation.lastValidation as StoredCalculationState["lastValidation"])
            : null,
        lastCalculatedAt:
          typeof savedLastCalculatedAt === "string" ? savedLastCalculatedAt : null,
      });
    } else {
      setCalculationState(EMPTY_RESULT_STORE);
      setProjectState("outdated");
    }

    setProjectName(project.name || "Projeto sem titulo");
    setCloudProjectId(project.id);
    setCloudVersionNumber(0);
    setCloudSaveState({
      status: "success",
      message: `Projeto "${project.name || "sem titulo"}" aberto da nuvem.`,
    });
    setLocalProjectFileState({
      status: "idle",
      message: null,
    });
    setIsMyProjectsOpen(false);
  }

  function handleConfirmCalculate() {
    const calculationAttempt = buildCalculationResultFromEditor({
      nodes,
      edges,
      energySettings,
    });

    if (calculationAttempt.status === "blocked") {
      setCalculationState((previousState) => ({
        status: "blocked",
        lastResult: previousState.lastResult,
        lastValidation: calculationAttempt.validation,
        lastCalculatedAt: previousState.lastCalculatedAt,
      }));

      setProjectState("outdated");
      return;
    }

    if (calculationAttempt.status === "failed") {
      setCalculationState((previousState) => ({
        status: "failed",
        lastResult: previousState.lastResult,
        lastValidation: calculationAttempt.validation,
        lastCalculatedAt: previousState.lastCalculatedAt,
      }));

      setProjectState("outdated");
      return;
    }

    setCalculationState({
      status: "success",
      lastResult: calculationAttempt.result,
      lastValidation: calculationAttempt.validation,
      lastCalculatedAt: calculationAttempt.result?.calculatedAt ?? null,
    });

    setProjectState("calculated");
  }

  function handleOpenTechnicalReport() {
    if (!calculationState.lastResult) {
      setLocalProjectFileState({
        status: "error",
        message: "Recalcule o projeto antes de abrir o relatorio tecnico.",
      });
      return;
    }

    handleExportPdf();
  }

  function handleExportCsv() {
    if (!calculationState.lastResult) {
      setLocalProjectFileState({
        status: "error",
        message: "Recalcule o projeto antes de exportar CSV.",
      });
      return;
    }

    downloadCalculationCsv(calculationState.lastResult);
    setLocalProjectFileState({
      status: "success",
      message: "CSV exportado com sucesso.",
    });
  }

  function handleExportPdf() {
    if (!calculationState.lastResult) {
      setLocalProjectFileState({
        status: "error",
        message: "Recalcule o projeto antes de gerar PDF.",
      });
      return;
    }

    try {
      openTechnicalReportPdfPrint({
        projectName,
        result: calculationState.lastResult,
      });
      setLocalProjectFileState({
        status: "success",
        message: "Relatorio aberto. Use Salvar como PDF na janela de impressao.",
      });
    } catch (error) {
      setLocalProjectFileState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel abrir o relatorio em PDF.",
      });
    }
  }
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Topbar
        projectName={projectName}
        projectState={projectState}
        onProjectNameChange={handleRenameProject}
        onCreateEmptyProject={handleCreateEmptyProject}
        onDownloadLocalProject={handleDownloadLocalProject}
        onImportLocalProject={handleImportLocalProject}
        localProjectFileStatus={localProjectFileState.status}
        localProjectFileMessage={localProjectFileState.message}
        onConfirmCalculate={handleConfirmCalculate}
        onCreateSimpleNetwork={handleCreateSimpleNetwork}
        onCreateCompleteNetwork={handleCreateCompleteNetwork}
        onAddComponent={handleAddComponent}
        onSaveCloudProject={handleSaveCloudProject}
        onOpenMyProjects={handleOpenMyProjects}        onOpenTechnicalReport={handleOpenTechnicalReport}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
        onAuthUserChange={setAuthUser}
        cloudSaveStatus={cloudSaveState.status}
        cloudSaveMessage={cloudSaveState.message}
        isCloudUserLoggedIn={Boolean(authUser)}
        validationErrorCount={validationErrorCount}        hasCalculationResult={Boolean(calculationState.lastResult)}
      />

      <main
        className="grid min-h-0 flex-1 transition-[grid-template-columns] duration-200 ease-in-out"
        style={{
          gridTemplateColumns: `${leftColumnWidth}px minmax(0,1fr) ${rightColumnWidth}px`,
        }}
      >
        <Sidebar
          isCollapsed={!isSidebarOpen}
          onToggle={() => setIsSidebarOpen((current) => !current)}
          onAddComponent={handleAddComponent}
          onResizeStart={handleStartSidebarResize}
          widthPx={sidebarWidth}
        />

        <section className="flex min-h-0 flex-col">
          <HydroSketchCanvas
            addRequest={addRequest}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            setSelectedNodeId={setSelectedNodeId}
            setSelectedEdgeId={setSelectedEdgeId}
            projectState={projectState}
            setProjectState={setProjectState}
            scaleSettings={scaleSettings}
            onCreateSimpleNetwork={handleCreateSimpleNetwork}
          />
        </section>

        <RightWorkspacePanel
          isOpen={isRightPanelOpen}
          widthPx={rightPanelWidth}
          selectedNode={selectedNode}
          projectState={projectState}
          calculationState={calculationState}
          scaleSettings={scaleSettings}
          energySettings={energySettings}
          onToggle={() => setIsRightPanelOpen((current) => !current)}
          onResizeStart={handleStartRightPanelResize}
          onUpdateScaleSettings={updateScaleSettings}
          onUpdateEnergySettings={updateEnergySettings}
          onUpdateSelectedNodeData={updateSelectedNodeData}
        />
      </main>

      <MyProjectsModal
        isOpen={isMyProjectsOpen}
        isLoading={isLoadingCloudProjects}
        errorMessage={cloudProjectsError}
        projects={cloudProjects}
        onClose={() => setIsMyProjectsOpen(false)}
        onRefresh={() => handleRefreshCloudProjects()}
        onOpenProject={handleOpenCloudProject}
      />

      <BottomStatusBar
        projectState={projectState}
        scaleSettings={scaleSettings}
      />
    </div>
  );
}



