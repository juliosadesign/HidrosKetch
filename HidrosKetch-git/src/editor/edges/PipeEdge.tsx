import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    type EdgeProps,
  } from "@xyflow/react";
  
  // Edge principal da Sprint 6.
  // Ele representa visualmente um cano/conexão hidráulica entre dois componentes.
  export function PipeEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    selected,
  }: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  
    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            strokeWidth: selected ? 4 : 3,
            stroke: selected ? "#67e8f9" : "#38bdf8",
          }}
        />
  
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none",
            }}
            className="rounded-full border border-cyan-400/40 bg-slate-950/90 px-2 py-1 text-[10px] font-semibold text-cyan-200 shadow"
          >
            fluxo →
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }