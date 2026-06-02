export type ComponentKind =
  | "pipe"
  | "accessory"
  | "valve"
  | "pump"
  | "reservoir"
  | "tank"
  | "junction"
  | "instrument"
  | "label";

export type CanvasPosition = {
  x: number;
  y: number;
};

export type FlowDirection =
  | "source-to-target"
  | "target-to-source"
  | "undefined";

export type ComponentVisualData = {
  rotationDeg: number;
  visible: boolean;
  locked: boolean;
  color?: string;
};

export type BaseComponent = {
  id: string;
  kind: ComponentKind;
  name: string;
  tag?: string;
  position: CanvasPosition;
  visual: ComponentVisualData;
  notes?: string;
};

// -------------------------
// PIPE / CANO
// -------------------------

export type PipeComponent = BaseComponent & {
  kind: "pipe";
  data: {
    diameterMm: number | null;
    lengthM: number | null;
    material?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
    flowDirection: FlowDirection;
  };
};

// -------------------------
// ACCESSORY / ACESSÓRIO COM K
// -------------------------

export type AccessoryType =
  | "elbow_90_short"
  | "elbow_90_long"
  | "elbow_45"
  | "curve_90"
  | "curve_45"
  | "tee_straight"
  | "tee_branch"
  | "entrance"
  | "exit"
  | "reduction"
  | "expansion"
  | "generic_accessory";

export type AccessoryComponent = BaseComponent & {
  kind: "accessory";
  data: {
    accessoryType: AccessoryType;
    kValue: number | null;
    diameterMm: number | null;
    kSource?: string;
    connectedPipeId?: string;
    flowDirection: FlowDirection;
  };
};

// -------------------------
// VALVE / VÁLVULA
// -------------------------

export type ValveType =
  | "gate_open"
  | "globe_open"
  | "check_valve"
  | "generic_valve";

export type ValveState = "open" | "partial" | "closed";

export type ValveComponent = BaseComponent & {
  kind: "valve";
  data: {
    valveType: ValveType;
    state: ValveState;
    kValue: number | null;
    diameterMm: number | null;
    openingPercentage?: number;
    flowDirection: FlowDirection;
  };
};

// -------------------------
// PUMP / BOMBA
// -------------------------

export type PumpComponent = BaseComponent & {
  kind: "pump";
  data: {
    headMca: number;
    flowDirection: FlowDirection;
    powerKw?: number;
    efficiencyPercent?: number;
  };
};

// -------------------------
// RESERVOIR / POÇO OU RESERVATÓRIO
// -------------------------

export type ReservoirType = "well" | "open_reservoir";

export type BoundaryRole = "source" | "destination" | "intermediate";

export type ReservoirComponent = BaseComponent & {
  kind: "reservoir";
  data: {
    reservoirType: ReservoirType;
    role: BoundaryRole;
    elevationM: number | null;
    surfacePressureKpa: number;
    isOpenToAtmosphere: boolean;
  };
};

// -------------------------
// TANK / TANQUE
// -------------------------

export type TankComponent = BaseComponent & {
  kind: "tank";
  data: {
    role: BoundaryRole;
    baseElevationM: number | null;
    waterLevelM: number | null;
    totalHeightM?: number;
    volumeM3?: number;
    topPressureKpa: number;
    isOpenToAtmosphere: boolean;
  };
};

// -------------------------
// JUNCTION / NÓ DE CONEXÃO
// -------------------------

export type JunctionType = "simple" | "branch" | "source" | "destination";

export type JunctionComponent = BaseComponent & {
  kind: "junction";
  data: {
    junctionType: JunctionType;
    elevationM?: number;
    connectedComponentIds: string[];
  };
};

// -------------------------
// INSTRUMENT / INSTRUMENTO
// -------------------------

export type InstrumentType = "pressure" | "flow" | "level" | "head_loss";

export type InstrumentComponent = BaseComponent & {
  kind: "instrument";
  data: {
    instrumentType: InstrumentType;
    measuredObjectId?: string;
    displayUnit: string;
    manualValue?: number;
  };
};

// -------------------------
// LABEL / TEXTO ANOTATIVO
// -------------------------

export type LabelComponent = BaseComponent & {
  kind: "label";
  data: {
    text: string;
    showInReport: boolean;
    attachedObjectId?: string;
  };
};

// União geral de todos os componentes possíveis da V1.
export type HydroComponent =
  | PipeComponent
  | AccessoryComponent
  | ValveComponent
  | PumpComponent
  | ReservoirComponent
  | TankComponent
  | JunctionComponent
  | InstrumentComponent
  | LabelComponent;

// Conexão visual/técnica entre componentes.
export type HydroConnection = {
  id: string;
  sourceComponentId: string;
  targetComponentId: string;
  sourceHandle?: string;
  targetHandle?: string;
  pipeId?: string;
};