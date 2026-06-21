import type {
    AccessoryType,
    BoundaryRole,
    FlowDirection,
    HydroComponent,
    HydroConnection,
    InstrumentType,
    JunctionType,
    ReservoirType,
    ValveState,
    ValveType,
  } from "../../types/component.types";

  import {
    detectBranchNodes,
    distributeBranchFlow,
    parseBranchNumberList,
    validateEditorBranching,
  } from "../branching";
  
  import type { ValidationIssue } from "../validation/validation.types";

  import type { HydroCalculationResult } from "../../types/result.types";
  import type { HydroSketchProject } from "../../types/project.types";
  import type { ProjectValidationResult } from "../validation/validation.types";
  
  import type {
    HydroFlowEdge,
    HydroFlowNode,
    ProjectEnergySettings,
  } from "../../editor/editor.types";
  
  import { createDefaultProject } from "../../domain/defaults/projectDefaults";
  import { validateProject } from "../validation/validateProject";
  import { runHydraulicPathCalculation } from "../hydraulicMath/hydraulicEngine";
  import type {
    HydraulicPathCalculationInput,
    LocalLossComponentInput,
    PumpInput,
  } from "../hydraulicMath/hydraulicEngine.types";
  
  export type BuildCalculationResultInput = {
    nodes: HydroFlowNode[];
    edges: HydroFlowEdge[];
    energySettings?: ProjectEnergySettings;
  };
  
  export type BuildCalculationResultOutput = {
    status: "blocked" | "success" | "failed";
    project: HydroSketchProject;
    validation: ProjectValidationResult;
    result: HydroCalculationResult | null;
  };
  
  // Esta conversão é uma adaptação segura da V1.
  // A rede visual ainda não possui solver completo.
  // Então transformamos os nós e conexões visuais em um projeto técnico simples.
  export function buildCalculationResultFromEditor(
    input: BuildCalculationResultInput
  ): BuildCalculationResultOutput {

const project = buildTemporaryProjectFromEditor(
  input.nodes,
  input.edges,
  input.energySettings
);

const projectValidation = validateProject(project);

const branchIssues = validateEditorBranching(
  input.nodes,
  input.edges,
  project.settings.defaultFlowLps ?? 2
);

const validation = mergeValidationIssues(projectValidation, branchIssues);

if (!validation.canCalculate) {
      return {
        status: "blocked",
        project,
        validation,
        result: null,
      };
    }
  
    const hydraulicInput = buildHydraulicPathInput(
  project,
  input.nodes,
  input.edges
);
  
    const calculationResult = runHydraulicPathCalculation(hydraulicInput);
  
    const branchWarnings = branchIssues
  .filter((issue) => issue.severity === "warning")
  .map((issue) => ({
    id: issue.id,
    message: issue.message,
    componentId: issue.componentId,
  }));

const resultWithDate: HydroCalculationResult = {
  ...calculationResult,
  calculatedAt:
    calculationResult.status === "success" ? new Date().toISOString() : null,
  warnings: [...calculationResult.warnings, ...branchWarnings],
};
  
    return {
      status: calculationResult.status === "success" ? "success" : "failed",
      project,
      validation,
      result: resultWithDate,
    };
  }
  
  function buildTemporaryProjectFromEditor(
    nodes: HydroFlowNode[],
    edges: HydroFlowEdge[],
    energySettings?: ProjectEnergySettings
  ): HydroSketchProject {
    const project = createDefaultProject();
  
    const components = nodes
      .map((node) => convertNodeToHydroComponent(node))
      .filter((component): component is HydroComponent => Boolean(component));
  
    const connections: HydroConnection[] = edges.map((edge) => ({
      id: edge.id,
      sourceComponentId: edge.source,
      targetComponentId: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      pipeId: undefined,
    }));
    const firstBranch = detectBranchNodes(nodes, edges)[0];
    return {
        ...project,
        status: "valid",
        settings: {
          ...project.settings,
          branchingMode: firstBranch?.branchingMode ?? project.settings.branchingMode,
          originElevationM:
            energySettings?.originElevationM ?? project.settings.originElevationM,
          destinationElevationM:
            energySettings?.destinationElevationM ??
            project.settings.destinationElevationM,
          requiredOutletPressureKpa:
            energySettings?.requiredOutletPressureKpa ??
            project.settings.requiredOutletPressureKpa,
        },
        components,
        connections,
        metadata: {
          ...project.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    
    function convertNodeToHydroComponent(node: HydroFlowNode): HydroComponent | null {
    const data = node.data.defaultData;
  
    const base = {
      id: node.id,
      name: node.data.label,
      tag: node.data.catalogItemId,
      position: node.position,
      visual: {
        rotationDeg: 0,
        visible: true,
        locked: false,
      },
      notes: "",
    };
  
    switch (node.data.componentKind) {
      case "pipe":
        return {
          ...base,
          kind: "pipe",
          data: {
            diameterMm: getNullableNumber(data, "diameterMm"),
            lengthM: getNullableNumber(data, "lengthM"),
            material: getOptionalString(data, "material"),
            sourceNodeId: getOptionalString(data, "sourceNodeId"),
            targetNodeId: getOptionalString(data, "targetNodeId"),
            flowDirection: getFlowDirection(data),
          },
        };
  
      case "accessory":
        return {
          ...base,
          kind: "accessory",
          data: {
            accessoryType: getString(data, "accessoryType", "generic_accessory") as AccessoryType,
            kValue: getNullableNumber(data, "kValue"),
            diameterMm: getNullableNumber(data, "diameterMm"),
            kSource: getOptionalString(data, "kSource"),
            connectedPipeId: getOptionalString(data, "connectedPipeId"),
            flowDirection: getFlowDirection(data),
          },
        };
  
      case "valve":
        return {
          ...base,
          kind: "valve",
          data: {
            valveType: getString(data, "valveType", "generic_valve") as ValveType,
            state: getString(data, "state", "open") as ValveState,
            kValue: getNullableNumber(data, "kValue"),
            diameterMm: getNullableNumber(data, "diameterMm"),
            openingPercentage: getOptionalNumber(data, "openingPercentage"),
            flowDirection: getFlowDirection(data),
          },
        };
  
      case "pump":
        return {
          ...base,
          kind: "pump",
          data: {
            headMca: getNumber(data, "headMca", 0),
            flowDirection: getFlowDirection(data),
            powerKw: getOptionalNumber(data, "powerKw"),
            efficiencyPercent: getOptionalNumber(data, "efficiencyPercent"),
          },
        };
  
      case "reservoir":
        return {
          ...base,
          kind: "reservoir",
          data: {
            reservoirType: getString(data, "reservoirType", "open_reservoir") as ReservoirType,
            role: getString(data, "role", "source") as BoundaryRole,
            elevationM: getNullableNumber(data, "elevationM"),
            surfacePressureKpa: getNumber(data, "surfacePressureKpa", 0),
            isOpenToAtmosphere: getBoolean(data, "isOpenToAtmosphere", true),
          },
        };
  
      case "tank":
        return {
          ...base,
          kind: "tank",
          data: {
            role: getString(data, "role", "destination") as BoundaryRole,
            baseElevationM: getNullableNumber(data, "baseElevationM"),
            waterLevelM: getNullableNumber(data, "waterLevelM"),
            totalHeightM: getOptionalNumber(data, "totalHeightM"),
            volumeM3: getOptionalNumber(data, "volumeM3"),
            topPressureKpa: getNumber(data, "topPressureKpa", 0),
            isOpenToAtmosphere: getBoolean(data, "isOpenToAtmosphere", true),
          },
        };
  
      case "junction":
        return {
          ...base,
          kind: "junction",
          data: {
            junctionType: getString(data, "junctionType", "simple") as JunctionType,
            elevationM: getOptionalNumber(data, "elevationM"),
            connectedComponentIds: [],
          },
        };
  
      case "instrument":
        return {
          ...base,
          kind: "instrument",
          data: {
            instrumentType: getString(data, "instrumentType", "pressure") as InstrumentType,
            measuredObjectId: getOptionalString(data, "measuredObjectId"),
            displayUnit: getString(data, "displayUnit", "kPa"),
            manualValue: getOptionalNumber(data, "manualValue"),
          },
        };
  
      case "label":
        return {
          ...base,
          kind: "label",
          data: {
            text: getString(data, "text", "Texto anotativo"),
            showInReport: getBoolean(data, "showInReport", true),
            attachedObjectId: getOptionalString(data, "attachedObjectId"),
          },
        };
  
      default:
        return null;
    }
  }
  
  function buildHydraulicPathInput(
    project: HydroSketchProject,
    nodes: HydroFlowNode[],
    edges: HydroFlowEdge[]
  ): HydraulicPathCalculationInput {
    const flowLps = project.settings.defaultFlowLps ?? 2;
    const defaultDiameterMm = findDefaultDiameterMm(project.components);
  
    const branchFlowMap = buildBranchFlowMap(
        nodes,
        edges,
        project.settings.defaultFlowLps ?? 2
      );
      
      const lossComponents: LocalLossComponentInput[] = project.components
        .filter((component) => component.kind === "accessory" || component.kind === "valve")
        .flatMap((component) => {
          if (component.kind === "accessory") {
            const isBranchAccessory =
              component.data.accessoryType === "tee_straight" ||
              component.data.accessoryType === "tee_branch";
      
            const branchFlows = branchFlowMap.get(component.id);
      
            if (isBranchAccessory && branchFlows && branchFlows.length > 0) {
              return branchFlows.map((flowLps, index) => ({
                componentId: `${component.id}_branch_${index + 1}`,
                componentName: `${component.name} - ramo ${index + 1}`,
                componentType: "accessory",
                kValue: component.data.kValue ?? 0,
                diameterMm: component.data.diameterMm ?? defaultDiameterMm,
                flowLps,
                observation:
                  "Ramo calculado com divisão simplificada de vazão da V1.",
              }));
            }
      
            return [
              {
                componentId: component.id,
                componentName: component.name,
                componentType: "accessory",
                kValue: component.data.kValue ?? 0,
                diameterMm: component.data.diameterMm ?? defaultDiameterMm,
                observation: "Acessório calculado por perda localizada.",
              },
            ];
          }
      
          return [
            {
              componentId: component.id,
              componentName: component.name,
              componentType: "valve",
              kValue: component.data.kValue ?? 0,
              diameterMm: component.data.diameterMm ?? defaultDiameterMm,
              observation: "Válvula calculada por perda localizada.",
            },
          ];
        });
  
    const pumps: PumpInput[] = project.components
      .filter((component) => component.kind === "pump")
      .map((component) => ({
        id: component.id,
        name: component.name,
        headMca: component.data.headMca,
      }));
  
    const originElevationM = findOriginElevationM(
      project.components,
      project.settings.originElevationM
    );
    const destinationElevationM = findDestinationElevationM(
      project.components,
      project.settings.destinationElevationM
    );
    const initialPressureHeadMca = findInitialPressureHeadMca(project.components);
    const requiredOutletPressureKpa = Math.max(
      0,
      project.settings.requiredOutletPressureKpa
    );
    const requiredPressureHeadMca = requiredOutletPressureKpa / 9.81;
  
    return {
      flowLps,
      defaultDiameterMm,
      originElevationM,
      destinationElevationM,
      initialPressureHeadMca,
      requiredOutletPressureKpa,
      requiredPressureHeadMca,
      lossComponents,
      pumps,
    };
  }
  
  function findDefaultDiameterMm(components: HydroComponent[]): number {
    for (const component of components) {
      if (
        (component.kind === "pipe" ||
          component.kind === "accessory" ||
          component.kind === "valve") &&
        component.data.diameterMm &&
        component.data.diameterMm > 0
      ) {
        return component.data.diameterMm;
      }
    }
  
    return 50;
  }
  
  function findOriginElevationM(
    components: HydroComponent[],
    fallbackElevationM: number
  ): number {
    for (const component of components) {
      if (component.kind === "reservoir" && component.data.role === "source") {
        return component.data.elevationM ?? 0;
      }
  
      if (component.kind === "tank" && component.data.role === "source") {
        return (component.data.baseElevationM ?? 0) + (component.data.waterLevelM ?? 0);
      }
  
      if (component.kind === "junction" && component.data.junctionType === "source") {
        return component.data.elevationM ?? 0;
      }
    }
  
    return fallbackElevationM;
  }
  
  function findDestinationElevationM(
    components: HydroComponent[],
    fallbackElevationM: number
  ): number {
    for (const component of components) {
      if (component.kind === "reservoir" && component.data.role === "destination") {
        return component.data.elevationM ?? 0;
      }
  
      if (component.kind === "tank" && component.data.role === "destination") {
        return (component.data.baseElevationM ?? 0) + (component.data.waterLevelM ?? 0);
      }
  
      if (component.kind === "junction" && component.data.junctionType === "destination") {
        return component.data.elevationM ?? 0;
      }
    }
  
    // Se o destino for apenas uma saída de tubulação, a V1 usa a cota geral do projeto.
    return fallbackElevationM;
  }
  
  function findInitialPressureHeadMca(components: HydroComponent[]): number {
    for (const component of components) {
      if (component.kind === "reservoir" && component.data.role === "source") {
        return component.data.surfacePressureKpa / 9.81;
      }
  
      if (component.kind === "tank" && component.data.role === "source") {
        return component.data.topPressureKpa / 9.81;
      }
    }
  
    return 0;
  }
  
  function getFlowDirection(data: Record<string, unknown>): FlowDirection {
    return getString(data, "flowDirection", "source-to-target") as FlowDirection;
  }
  
  function getString(
    data: Record<string, unknown>,
    key: string,
    fallback: string
  ): string {
    const value = data[key];
  
    return typeof value === "string" ? value : fallback;
  }
  
  function getOptionalString(
    data: Record<string, unknown>,
    key: string
  ): string | undefined {
    const value = data[key];
  
    return typeof value === "string" ? value : undefined;
  }
  
  function getNumber(
    data: Record<string, unknown>,
    key: string,
    fallback: number
  ): number {
    const value = data[key];
  
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }
  
  function getOptionalNumber(
    data: Record<string, unknown>,
    key: string
  ): number | undefined {
    const value = data[key];
  
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  }
  
  function getNullableNumber(
    data: Record<string, unknown>,
    key: string
  ): number | null {
    const value = data[key];
  
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }
  
  function getBoolean(
    data: Record<string, unknown>,
    key: string,
    fallback: boolean
  ): boolean {
    const value = data[key];
  
    return typeof value === "boolean" ? value : fallback;
  }
  function mergeValidationIssues(
    baseValidation: ProjectValidationResult,
    extraIssues: ValidationIssue[]
  ): ProjectValidationResult {
    const allErrors = [
      ...baseValidation.errors,
      ...extraIssues.filter((issue) => issue.severity === "error"),
    ];
  
    const allWarnings = [
      ...baseValidation.warnings,
      ...extraIssues.filter((issue) => issue.severity === "warning"),
    ];
  
    return {
      canCalculate: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }
  
  function buildBranchFlowMap(
    nodes: HydroFlowNode[],
    edges: HydroFlowEdge[],
    totalFlowLps: number
  ): Map<string, number[]> {
    const branchFlowMap = new Map<string, number[]>();
  
    const branches = detectBranchNodes(nodes, edges);
  
    for (const branch of branches) {
      const distribution = distributeBranchFlow({
        totalFlowLps,
        branchCount: branch.branchCount,
        mode: branch.branchingMode,
        manualFlowsLps: parseBranchNumberList(
          branch.defaultData.branchManualFlowsText
        ),
        percentages: parseBranchNumberList(
          branch.defaultData.branchPercentagesText
        ),
        demandsLps: parseBranchNumberList(branch.defaultData.branchDemandsText),
      });
  
      if (distribution.valid) {
        branchFlowMap.set(branch.nodeId, distribution.flowsLps);
      }
    }
  
    return branchFlowMap;
  }