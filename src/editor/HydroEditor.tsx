import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    type Dispatch,
    type SetStateAction,
  } from "react";

  import {
    Controls,
    MarkerType,
    MiniMap,
    ReactFlow,
    type Connection,
    type EdgeTypes,
    type NodeTypes,
    type OnEdgesChange,
    type OnNodesChange,
  } from "@xyflow/react";

  import type {
    AddComponentRequest,
    EditorScaleSettings,
    HydroFlowEdge,
    HydroFlowNode,
    ProjectVisualState,
  } from "./editor.types";

  import { createNodeFromCatalogItem } from "./tools/addComponentTool";
  import { validateHydroConnection } from "./tools/connectionRules";
  import { calculateEdgeLengthMeters } from "./tools/scaleCalibration";

  import { GridOverlay } from "./grid/GridOverlay";
  import { HorizontalRuler } from "./ruler/HorizontalRuler";
  import { VerticalRuler } from "./ruler/VerticalRuler";
  import { formatMeters } from "./ruler/scaleUtils";

  import { PipeNode } from "./nodes/PipeNode";
  import { AccessoryNode } from "./nodes/AccessoryNode";
  import { ValveNode } from "./nodes/ValveNode";
  import { PumpNode } from "./nodes/PumpNode";
  import { ReservoirNode } from "./nodes/ReservoirNode";
  import { TankNode } from "./nodes/TankNode";
  import { InstrumentNode } from "./nodes/InstrumentNode";
  import { LabelNode } from "./nodes/LabelNode";

  import { PipeEdge } from "./edges/PipeEdge";
  import { FlowEdge } from "./edges/FlowEdge";

  type HydroEditorProps = {
    addRequest: AddComponentRequest | null;

    nodes: HydroFlowNode[];
    edges: HydroFlowEdge[];

    setNodes: Dispatch<SetStateAction<HydroFlowNode[]>>;
    setEdges: Dispatch<SetStateAction<HydroFlowEdge[]>>;

    onNodesChange: OnNodesChange<HydroFlowNode>;
    onEdgesChange: OnEdgesChange<HydroFlowEdge>;

    selectedNodeId: string | null;
    selectedEdgeId: string | null;

    setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
    setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;

    projectState: ProjectVisualState;
    setProjectState: Dispatch<SetStateAction<ProjectVisualState>>;

    scaleSettings: EditorScaleSettings;
  };

  const RULER_HEIGHT_PX = 32;
  const RULER_WIDTH_PX = 48;
  const EDITOR_BOTTOM_SAFE_AREA_PX = 96;

  export function HydroEditor({
    addRequest,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    projectState,
    setProjectState,
    scaleSettings,
  }: HydroEditorProps) {
    const addSequenceRef = useRef(0);

    const nodeTypes = useMemo<NodeTypes>(
      () => ({
        pipe: PipeNode,
        accessory: AccessoryNode,
        valve: ValveNode,
        pump: PumpNode,
        reservoir: ReservoirNode,
        tank: TankNode,
        junction: AccessoryNode,
        instrument: InstrumentNode,
        label: LabelNode,
      }),
      []
    );

    const edgeTypes = useMemo<EdgeTypes>(
      () => ({
        pipe: PipeEdge,
        flow: FlowEdge,
      }),
      []
    );

    useEffect(() => {
      if (!addRequest) return;

      addSequenceRef.current += 1;

      const newNode = createNodeFromCatalogItem(
        addRequest.component,
        addSequenceRef.current
      ) as HydroFlowNode;

      setNodes((currentNodes) => [
        ...currentNodes.map((node) => ({
          ...node,
          selected: false,
        })),
        newNode,
      ]);

      setSelectedNodeId(newNode.id);
      setSelectedEdgeId(null);
      setProjectState("outdated");
    }, [
      addRequest,
      setNodes,
      setSelectedNodeId,
      setSelectedEdgeId,
      setProjectState,
    ]);

    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);

    const selectedEdgeLengthMeters =
      selectedEdge === undefined
        ? null
        : calculateEdgeLengthMeters(
            selectedEdge,
            nodes,
            scaleSettings.pixelsPerMeter
          );

    const handleNodesChange = useCallback(
      (changes: Parameters<typeof onNodesChange>[0]) => {
        const changedPosition = changes.some(
          (change) => change.type === "position" || change.type === "remove"
        );

        if (changedPosition) {
          setProjectState("outdated");
        }

        onNodesChange(changes);
      },
      [onNodesChange, setProjectState]
    );

    const handleEdgesChange = useCallback(
      (changes: Parameters<typeof onEdgesChange>[0]) => {
        const removedEdge = changes.some((change) => change.type === "remove");

        if (removedEdge) {
          setProjectState("outdated");
        }

        onEdgesChange(changes);
      },
      [onEdgesChange, setProjectState]
    );

    const handleConnect = useCallback(
      (connection: Connection) => {
        const validation = validateHydroConnection(connection, nodes);

        if (!validation.valid) {
          return;
        }

        const alreadyExists = edges.some(
          (edge) =>
            edge.source === connection.source &&
            edge.target === connection.target &&
            edge.sourceHandle === connection.sourceHandle &&
            edge.targetHandle === connection.targetHandle
        );

        if (alreadyExists) {
          return;
        }

        const newEdge: HydroFlowEdge = {
          id: `pipe_edge_${Date.now()}`,
          source: connection.source!,
          target: connection.target!,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: "pipe",
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#38bdf8",
          },
          data: {
            kind: "pipe",
            status: "outdated",
            label: "Cano / fluxo",
          },
        };

        setEdges((currentEdges) => [...currentEdges, newEdge]);
        setSelectedEdgeId(newEdge.id);
        setSelectedNodeId(null);
        setProjectState("outdated");
      },
      [
        edges,
        nodes,
        setEdges,
        setSelectedEdgeId,
        setSelectedNodeId,
        setProjectState,
      ]
    );

    const handleDeleteSelectedNode = useCallback(() => {
      if (!selectedNodeId) return;

      setNodes((currentNodes) =>
        currentNodes.filter((node) => node.id !== selectedNodeId)
      );

      setEdges((currentEdges) =>
        currentEdges.filter(
          (edge) =>
            edge.source !== selectedNodeId && edge.target !== selectedNodeId
        )
      );

      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setProjectState("outdated");
    }, [
      selectedNodeId,
      setEdges,
      setNodes,
      setSelectedNodeId,
      setSelectedEdgeId,
      setProjectState,
    ]);

    const handleCloneSelectedNode = useCallback(() => {
      if (!selectedNodeId) return;

      const nodeToClone = nodes.find((node) => node.id === selectedNodeId);

      if (!nodeToClone) return;

      const cloneId = `${nodeToClone.data.componentKind}_${nodeToClone.data.catalogItemId}_clone_${Date.now()}`;
      const clonedNode: HydroFlowNode = {
        ...nodeToClone,
        id: cloneId,
        selected: true,
        position: {
          x: nodeToClone.position.x + 56,
          y: nodeToClone.position.y + 56,
        },
        data: {
          ...nodeToClone.data,
          label: `${nodeToClone.data.label} (copia)`,
          defaultData: {
            ...nodeToClone.data.defaultData,
          },
        },
      };

      setNodes((currentNodes) => [
        ...currentNodes.map((node) => ({
          ...node,
          selected: false,
        })),
        clonedNode,
      ]);

      setSelectedNodeId(cloneId);
      setSelectedEdgeId(null);
      setProjectState("outdated");
    }, [
      nodes,
      selectedNodeId,
      setNodes,
      setSelectedNodeId,
      setSelectedEdgeId,
      setProjectState,
    ]);

    const handleDeleteSelectedEdge = useCallback(() => {
      if (!selectedEdgeId) return;

      setEdges((currentEdges) =>
        currentEdges.filter((edge) => edge.id !== selectedEdgeId)
      );

      setSelectedEdgeId(null);
      setProjectState("outdated");
    }, [selectedEdgeId, setEdges, setSelectedEdgeId, setProjectState]);

    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0"
          style={{
            paddingTop: scaleSettings.rulerEnabled ? RULER_HEIGHT_PX : 0,
            paddingLeft: scaleSettings.rulerEnabled ? RULER_WIDTH_PX : 0,
            paddingBottom: EDITOR_BOTTOM_SAFE_AREA_PX,
          }}
        >
          <div className="h-full w-full overflow-hidden rounded-tl-2xl border-l border-t border-slate-800/70 bg-slate-950">
            <ReactFlow<HydroFlowNode, HydroFlowEdge>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onNodeClick={(_, node) => {
                setSelectedNodeId(node.id);
                setSelectedEdgeId(null);
              }}
              onEdgeClick={(_, edge) => {
                setSelectedEdgeId(edge.id);
                setSelectedNodeId(null);
              }}
              onPaneClick={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }}
              fitView
              panOnScroll
              selectionOnDrag
              snapToGrid={scaleSettings.snapEnabled}
              snapGrid={[scaleSettings.gridSpacingPx, scaleSettings.gridSpacingPx]}
              className="hidrosketch-flow"
            >
              <GridOverlay
                enabled={scaleSettings.gridEnabled}
                gridSpacingPx={scaleSettings.gridSpacingPx}
              />

              <Controls
                position="top-right"
                className="!right-4 !top-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/95 shadow-xl shadow-slate-950/40 [&_button]:!border-slate-800 [&_button]:!bg-slate-900 [&_button]:!text-slate-100 [&_button:hover]:!bg-cyan-500/20"
              />

              <MiniMap
                pannable
                zoomable
                position="bottom-right"
                maskColor="rgba(15, 23, 42, 0.72)"
                nodeColor={() => "#38bdf8"}
                nodeStrokeColor={() => "#0f172a"}
                nodeBorderRadius={8}
                className="!right-4 !bottom-4 overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl shadow-slate-950/50"
                style={{
                  width: 180,
                  height: 105,
                  background: "rgba(2, 6, 23, 0.96)",
                }}
              />
            </ReactFlow>
          </div>
        </div>

        <HorizontalRuler
          enabled={scaleSettings.rulerEnabled}
          pixelsPerMeter={scaleSettings.pixelsPerMeter}
          offsetLeftPx={RULER_WIDTH_PX}
        />

        <VerticalRuler
          enabled={scaleSettings.rulerEnabled}
          pixelsPerMeter={scaleSettings.pixelsPerMeter}
          offsetTopPx={RULER_HEIGHT_PX}
        />

        {scaleSettings.rulerEnabled && (
          <div className="pointer-events-none absolute left-0 top-0 z-40 flex h-8 w-12 items-center justify-center border-b border-r border-slate-700 bg-slate-950/95 text-[10px] font-semibold text-cyan-300">
            0,0
          </div>
        )}

        <div
          className="pointer-events-none absolute rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl shadow-slate-950/40 backdrop-blur"
          style={{
            left: scaleSettings.rulerEnabled ? RULER_WIDTH_PX + 16 : 16,
            top: scaleSettings.rulerEnabled ? RULER_HEIGHT_PX + 16 : 16,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Editor visual
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Nos adicionados:{" "}
            <span className="font-semibold text-white">{nodes.length}</span>
          </p>

          <p className="mt-1 text-sm text-slate-300">
            Conexoes:{" "}
            <span className="font-semibold text-white">{edges.length}</span>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Escala: 1 m = {scaleSettings.pixelsPerMeter}px
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Grade: {scaleSettings.gridEnabled ? "ativa" : "inativa"} | Snap:{" "}
            {scaleSettings.snapEnabled ? "ativo" : "inativo"}
          </p>

          <p className="mt-1 text-xs text-yellow-300">
            Estado: {projectState === "calculated"
              ? "Calculado"
              : projectState === "outdated"
                ? "Desatualizado"
                : "Rascunho"}
          </p>
        </div>

        <div
          className="absolute z-30 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 shadow-xl shadow-slate-950/40 backdrop-blur"
          style={{
            left: scaleSettings.rulerEnabled ? RULER_WIDTH_PX + 16 : 16,
            bottom: 16,
            right: 16,
          }}
        >
          <button
            type="button"
            onClick={handleDeleteSelectedNode}
            disabled={!selectedNodeId}
            className="rounded-xl border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Deletar componente
          </button>

          <button
            type="button"
            onClick={handleCloneSelectedNode}
            disabled={!selectedNodeId}
            className="rounded-xl border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            title={
              selectedNodeId
                ? "Duplica o componente selecionado sem copiar conexoes."
                : "Selecione um componente para clonar."
            }
          >
            Clonar componente
          </button>

          <button
            type="button"
            onClick={handleDeleteSelectedEdge}
            disabled={!selectedEdgeId}
            className="rounded-xl border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Deletar conexao
          </button>

          <div className="text-xs text-slate-400">
            {selectedNode && (
              <>
                Selecionado:{" "}
                <span className="font-semibold text-slate-100">
                  {selectedNode.data.label}
                </span>
              </>
            )}

            {selectedEdge && (
              <>
                Conexao selecionada:{" "}
                <span className="font-semibold text-slate-100">
                  {selectedEdge.data?.label ?? selectedEdge.id}
                </span>
                {selectedEdgeLengthMeters !== null && (
                  <span className="ml-2 text-cyan-300">
                    | Comprimento visual:{" "}
                    {formatMeters(selectedEdgeLengthMeters)}
                  </span>
                )}
              </>
            )}

            {!selectedNode && !selectedEdge && "Nenhum item selecionado"}
          </div>
        </div>
      </div>
    );
  }
