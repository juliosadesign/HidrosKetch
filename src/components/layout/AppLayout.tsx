import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useEdgesState, useNodesState } from "@xyflow/react";

import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { BottomStatusBar } from "./BottomStatusBar";
import { HydroSketchCanvas } from "../../editor/HydroSketchCanvas";
import { PropertiesPanel } from "../panels/PropertiesPanel";
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
import { createSimpleHydraulicNetworkTemplate } from "../../editor/templates/simpleNetworkTemplate";
import {
  listUserCloudProjects,
  saveProjectToCloud,
  type CloudProjectRecord,
} from "../../lib/cloudProjects";
import { supabase } from "../../lib/supabaseClient";
import type { Json } from "../../types/supabase.types";

const initialNodes: HydroFlowNode[] = [];
const initialEdges: HydroFlowEdge[] = [];

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_DEFAULT_WIDTH = 280;
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 420;

const PROPERTIES_COLLAPSED_WIDTH = 52;
const PROPERTIES_DEFAULT_WIDTH = 340;
const PROPERTIES_MIN_WIDTH = 300;
const PROPERTIES_MAX_WIDTH = 520;
const CLOUD_PROJECT_FORMAT_VERSION = "1.0";

type CloudSaveState = {
  status: "idle" | "saving" | "success" | "error";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(
    PROPERTIES_DEFAULT_WIDTH
  );

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
  const [projectName] = useState("Projeto HidroSketch");

  const [scaleSettings, setScaleSettings] = useState({
    pixelsPerMeter: 40,
    gridSpacingPx: 20,
    gridEnabled: true,
    rulerEnabled: true,
    snapEnabled: true,
  });

  const [energySettings, setEnergySettings] = useState<ProjectEnergySettings>({
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

  const rightColumnWidth = isPropertiesPanelOpen
    ? propertiesPanelWidth
    : PROPERTIES_COLLAPSED_WIDTH;

  function handleStartSidebarResize(
    event: ReactMouseEvent<HTMLDivElement>
  ) {
    startPanelResize("left", event, sidebarWidth);
  }

  function handleStartPropertiesResize(
    event: ReactMouseEvent<HTMLDivElement>
  ) {
    startPanelResize("right", event, propertiesPanelWidth);
  }

  function startPanelResize(
    side: "left" | "right",
    event: ReactMouseEvent<HTMLDivElement>,
    startWidth: number
  ) {
    event.preventDefault();

    const startX = event.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handleMouseMove(moveEvent: MouseEvent) {
      const delta = moveEvent.clientX - startX;

      if (side === "left") {
        setSidebarWidth(
          clamp(startWidth + delta, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH)
        );
        return;
      }

      setPropertiesPanelWidth(
        clamp(startWidth - delta, PROPERTIES_MIN_WIDTH, PROPERTIES_MAX_WIDTH)
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
    setCloudProjectId(null);
    setCloudVersionNumber(0);
    setCloudSaveState({
      status: "idle",
      message: null,
    });

    setEnergySettings((current) => ({
      ...current,
      originElevationM: 0,
      destinationElevationM: 10,
      requiredOutletPressureKpa: 50,
      operationHoursPerDay: 2,
      operationDaysPerMonth: 30,
      energyTariffBRLKwh: 0.9,
    }));
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
        "Projeto salvo pelo HidroSketch com componentes, conexões e configurações técnicas.",
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
        "Este projeto não possui dados válidos para abrir no editor."
      );
      return;
    }

    const editor = projectJson.editor;

    if (!Array.isArray(editor.nodes) || !Array.isArray(editor.edges)) {
      setCloudProjectsError(
        "Este projeto não contém componentes e conexões em formato válido."
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

    setCloudProjectId(project.id);
    setCloudVersionNumber(0);
    setCloudSaveState({
      status: "success",
      message: `Projeto “${project.name || "sem título"}” aberto da nuvem.`,
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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Topbar
        projectState={projectState}
        onConfirmCalculate={handleConfirmCalculate}
        onCreateSimpleNetwork={handleCreateSimpleNetwork}
        onAddComponent={handleAddComponent}
        onSaveCloudProject={handleSaveCloudProject}
        onOpenMyProjects={handleOpenMyProjects}
        onAuthUserChange={setAuthUser}
        cloudSaveStatus={cloudSaveState.status}
        cloudSaveMessage={cloudSaveState.message}
        isCloudUserLoggedIn={Boolean(authUser)}
        validationErrorCount={validationErrorCount}
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

        <PropertiesPanel
          selectedNode={selectedNode}
          projectState={projectState}
          calculationState={calculationState}
          scaleSettings={scaleSettings}
          energySettings={energySettings}
          onUpdateScaleSettings={updateScaleSettings}
          onUpdateEnergySettings={updateEnergySettings}
          isCollapsed={!isPropertiesPanelOpen}
          onToggle={() => setIsPropertiesPanelOpen((current) => !current)}
          onResizeStart={handleStartPropertiesResize}
          widthPx={propertiesPanelWidth}
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
