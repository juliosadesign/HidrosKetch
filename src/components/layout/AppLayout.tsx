import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { PropertiesPanel } from "./PropertiesPanel";
import { BottomStatusBar } from "./BottomStatusBar";
import { HydroSketchCanvas } from "../../editor/HydroSketchCanvas";

// Layout geral do HidroSketch.
// Aqui organizamos a tela como um software técnico:
// topo, biblioteca lateral, prancheta central, painel direito e barra inferior.
export function AppLayout() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Topbar />

      <main className="grid min-h-0 flex-1 grid-cols-[280px_1fr_340px]">
        <Sidebar />
        <HydroSketchCanvas />
        <PropertiesPanel />
      </main>

      <BottomStatusBar />
    </div>
  );
}