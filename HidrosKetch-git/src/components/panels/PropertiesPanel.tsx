import type {
    EditorScaleSettings,
    HydroFlowNode,
    ProjectVisualState,
    UpdateScaleSettings,
    UpdateSelectedNodeData,
  } from "../../editor/editor.types";
  
  import type { StoredCalculationState } from "../../store/resultStore";
  
  import { ProjectProperties } from "./ProjectProperties";
  import { PipeProperties } from "./PipeProperties";
  import { AccessoryProperties } from "./AccessoryProperties";
  import { ValveProperties } from "./ValveProperties";
  import { PumpProperties } from "./PumpProperties";
  import { ReservoirProperties } from "./ReservoirProperties";
  import { TankProperties } from "./TankProperties";
  import { InstrumentProperties } from "./InstrumentProperties";
  import { LabelProperties } from "./LabelProperties";
  
  type PropertiesPanelProps = {
    selectedNode: HydroFlowNode | null;
    projectState: ProjectVisualState;
    calculationState: StoredCalculationState;
    scaleSettings: EditorScaleSettings;
    onUpdateScaleSettings: UpdateScaleSettings;
    onUpdateSelectedNodeData: UpdateSelectedNodeData;
  };
  
  export function PropertiesPanel({
    selectedNode,
    projectState,
    calculationState,
    scaleSettings,
    onUpdateScaleSettings,
    onUpdateSelectedNodeData,
  }: PropertiesPanelProps) {
    function renderContent() {
      if (!selectedNode) {
        return (
          <ProjectProperties
            projectState={projectState}
            calculationState={calculationState}
            scaleSettings={scaleSettings}
            onUpdateScaleSettings={onUpdateScaleSettings}
          />
        );
      }
  
      switch (selectedNode.data.componentKind) {
        case "pipe":
          return (
            <PipeProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "accessory":
          return (
            <AccessoryProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "valve":
          return (
            <ValveProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "pump":
          return (
            <PumpProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "reservoir":
          return (
            <ReservoirProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "tank":
          return (
            <TankProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "instrument":
          return (
            <InstrumentProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        case "label":
          return (
            <LabelProperties
              node={selectedNode}
              onUpdate={onUpdateSelectedNodeData}
            />
          );
  
        default:
          return (
            <ProjectProperties
              projectState={projectState}
              calculationState={calculationState}
              scaleSettings={scaleSettings}
              onUpdateScaleSettings={onUpdateScaleSettings}
            />
          );
      }
    }
  
    return (
      <aside className="min-h-0 overflow-y-auto border-l border-slate-800 bg-slate-900/70 p-4">
        {renderContent()}
      </aside>
    );
  }