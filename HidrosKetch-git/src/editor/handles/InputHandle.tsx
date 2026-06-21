import { Handle, Position } from "@xyflow/react";

// Ponto de entrada do componente.
// Outros componentes devem conectar sua saída neste ponto.
export function InputHandle() {
  return (
    <Handle
      id="in"
      type="target"
      position={Position.Left}
      className="!h-3 !w-3 !border-2 !border-slate-950 !bg-emerald-400"
    />
  );
}