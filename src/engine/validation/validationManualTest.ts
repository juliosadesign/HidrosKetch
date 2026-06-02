import type { HydroSketchProject } from "../../types/project.types";
import type { HydroComponent, HydroConnection } from "../../types/component.types";

import { createDefaultProject } from "../../domain/defaults/projectDefaults";
import { validateProject } from "./validateProject";

function printResult(title: string, project: HydroSketchProject) {
  const result = validateProject(project);

  console.log(`\n=== ${title} ===`);
  console.log("Pode calcular?", result.canCalculate ? "SIM" : "NÃO");

  console.log("\nErros:");
  console.table(
    result.errors.map((error) => ({
      code: error.code,
      componentId: error.componentId ?? "-",
      message: error.message,
    }))
  );

  console.log("\nAlertas:");
  console.table(
    result.warnings.map((warning) => ({
      code: warning.code,
      componentId: warning.componentId ?? "-",
      message: warning.message,
    }))
  );
}

function baseVisual() {
  return {
    rotationDeg: 0,
    visible: true,
    locked: false,
  };
}

// --------------------------------------------------
// Projeto 1: inválido
// Sem origem, sem destino, sem vazão, sem conexão,
// cano sem diâmetro, acessório sem K e bomba inválida.
// --------------------------------------------------

const invalidProject = createDefaultProject();

invalidProject.settings.defaultFlowLps = null;
invalidProject.settings.scale.pixelsPerMeter = 0;

invalidProject.components = [
  {
    id: "pipe_01",
    kind: "pipe",
    name: "Cano sem diâmetro",
    position: { x: 0, y: 0 },
    visual: baseVisual(),
    data: {
      diameterMm: null,
      lengthM: 2,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "accessory_01",
    kind: "accessory",
    name: "Acessório sem K",
    position: { x: 100, y: 0 },
    visual: baseVisual(),
    data: {
      accessoryType: "elbow_90_short",
      kValue: null,
      diameterMm: 50,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "pump_01",
    kind: "pump",
    name: "Bomba inválida",
    position: { x: 200, y: 0 },
    visual: baseVisual(),
    data: {
      headMca: -1,
      flowDirection: "source-to-target",
    },
  },
] satisfies HydroComponent[];

invalidProject.connections = [];

// --------------------------------------------------
// Projeto 2: válido, mas com alertas
// Possui reservatório aberto e ramificação com divisão igual.
// --------------------------------------------------

const warningProject = createDefaultProject();

warningProject.settings.defaultFlowLps = 2;
warningProject.settings.branchingMode = "equal";
warningProject.settings.scale.pixelsPerMeter = 40;

warningProject.components = [
  {
    id: "reservoir_01",
    kind: "reservoir",
    name: "Reservatório de origem",
    position: { x: 0, y: 0 },
    visual: baseVisual(),
    data: {
      reservoirType: "open_reservoir",
      role: "source",
      elevationM: 0,
      surfacePressureKpa: 0,
      isOpenToAtmosphere: true,
    },
  },
  {
    id: "pump_01",
    kind: "pump",
    name: "Bomba padrão",
    position: { x: 120, y: 0 },
    visual: baseVisual(),
    data: {
      headMca: 10,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "tee_01",
    kind: "accessory",
    name: "Tê de ramificação",
    position: { x: 240, y: 0 },
    visual: baseVisual(),
    data: {
      accessoryType: "tee_branch",
      kValue: 1.8,
      diameterMm: 50,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "exit_01",
    kind: "accessory",
    name: "Saída",
    position: { x: 360, y: 0 },
    visual: baseVisual(),
    data: {
      accessoryType: "exit",
      kValue: 1,
      diameterMm: 50,
      flowDirection: "source-to-target",
    },
  },
] satisfies HydroComponent[];

warningProject.connections = [
  {
    id: "connection_01",
    sourceComponentId: "reservoir_01",
    targetComponentId: "pump_01",
  },
  {
    id: "connection_02",
    sourceComponentId: "pump_01",
    targetComponentId: "tee_01",
  },
  {
    id: "connection_03",
    sourceComponentId: "tee_01",
    targetComponentId: "exit_01",
  },
] satisfies HydroConnection[];

// --------------------------------------------------
// Projeto 3: válido simples
// Sem ramificação, com origem, bomba, válvula e saída.
// --------------------------------------------------

const validProject = createDefaultProject();

validProject.settings.defaultFlowLps = 2;
validProject.settings.branchingMode = "manual";
validProject.settings.scale.pixelsPerMeter = 40;

validProject.components = [
  {
    id: "reservoir_01",
    kind: "reservoir",
    name: "Reservatório de origem",
    position: { x: 0, y: 0 },
    visual: baseVisual(),
    data: {
      reservoirType: "open_reservoir",
      role: "source",
      elevationM: 0,
      surfacePressureKpa: 0,
      isOpenToAtmosphere: true,
    },
  },
  {
    id: "pump_01",
    kind: "pump",
    name: "Bomba padrão",
    position: { x: 120, y: 0 },
    visual: baseVisual(),
    data: {
      headMca: 10,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "valve_01",
    kind: "valve",
    name: "Válvula de gaveta",
    position: { x: 240, y: 0 },
    visual: baseVisual(),
    data: {
      valveType: "gate_open",
      state: "open",
      kValue: 0.2,
      diameterMm: 50,
      flowDirection: "source-to-target",
    },
  },
  {
    id: "exit_01",
    kind: "accessory",
    name: "Saída",
    position: { x: 360, y: 0 },
    visual: baseVisual(),
    data: {
      accessoryType: "exit",
      kValue: 1,
      diameterMm: 50,
      flowDirection: "source-to-target",
    },
  },
] satisfies HydroComponent[];

validProject.connections = [
  {
    id: "connection_01",
    sourceComponentId: "reservoir_01",
    targetComponentId: "pump_01",
  },
  {
    id: "connection_02",
    sourceComponentId: "pump_01",
    targetComponentId: "valve_01",
  },
  {
    id: "connection_03",
    sourceComponentId: "valve_01",
    targetComponentId: "exit_01",
  },
] satisfies HydroConnection[];

printResult("PROJETO INVÁLIDO", invalidProject);
printResult("PROJETO COM ALERTAS", warningProject);
printResult("PROJETO VÁLIDO", validProject);