import { Handle, Position } from "@xyflow/react";

// Ponto de saída do componente.
// Este ponto inicia o fluxo em direção a uma entrada.
export function OutputHandle() {
  return (
    <Handle
      id="out"
      type="source"
      position={Position.Right}
      className="!h-3 !w-3 !border-2 !border-slate-950 !bg-cyan-400"
    />
  );
}