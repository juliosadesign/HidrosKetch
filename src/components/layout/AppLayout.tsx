import { useMemo, useRef, useState } from "react";
import { useEdgesState, useNodesState } from "@xyflow/react";

import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { BottomStatusBar } from "./BottomStatusBar";
import { HydroSketchCanvas } from "../../editor/HydroSketchCanvas";
import { PropertiesPanel } from "../panels/PropertiesPanel";

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

const initialNodes: HydroFlowNode[] = [];
const initialEdges: HydroFlowEdge[] = [];

export function AppLayout() {
  const requestCounterRef = useRef(0);

  const [addRequest, setAddRequest] = useState<AddComponentRequest | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<HydroFlowNode>(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<HydroFlowEdge>(initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [projectState, setProjectState] =
    useState<ProjectVisualState>("draft");

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

  function handleConfirmCalculate() {
    const calculationAttempt = buildCalculationResultFromEditor({
      nodes,
      edges,
      energySettings,
    });
  
    if (calculationAttempt.status === "blocked") {
      setCalculationState((previousState) => ({
        status: "blocked",
  
        // Sprint 9:
        // preserva o último resultado válido mesmo quando a nova tentativa falha.
        lastResult: previousState.lastResult,
  
        lastValidation: calculationAttempt.validation,
  
        // mantém a data do último cálculo válido.
        lastCalculatedAt: previousState.lastCalculatedAt,
      }));
  
      setProjectState("outdated");
      return;
    }
  
    if (calculationAttempt.status === "failed") {
      setCalculationState((previousState) => ({
        status: "failed",
  
        // Também preservamos o último resultado válido em caso de falha técnica.
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
        validationErrorCount={validationErrorCount}
      />

      <main
        className={`grid min-h-0 flex-1 transition-[grid-template-columns] duration-300 ease-in-out ${
          isSidebarOpen
            ? isPropertiesPanelOpen
              ? "grid-cols-[280px_1fr_340px]"
              : "grid-cols-[280px_1fr_52px]"
            : isPropertiesPanelOpen
              ? "grid-cols-[72px_1fr_340px]"
              : "grid-cols-[72px_1fr_52px]"
        }`}
      >
        <Sidebar
          isCollapsed={!isSidebarOpen}
          onToggle={() => setIsSidebarOpen((current) => !current)}
          onAddComponent={handleAddComponent}
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
  onUpdateSelectedNodeData={updateSelectedNodeData}
/>
      </main>

      <BottomStatusBar 
        projectState={projectState}
        scaleSettings={scaleSettings}
      />
    </div>
  );
}