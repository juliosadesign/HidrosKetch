// Tipos gerais ligados à hidráulica, unidades e configuração matemática.
// Aqui ainda NÃO existe cálculo. Apenas definimos formatos de dados.

export type FlowUnit = "L/s" | "m³/s";
export type DiameterUnit = "mm" | "m";
export type LengthUnit = "m";
export type PressureUnit = "Pa" | "kPa" | "mca";
export type HeadUnit = "mca" | "m";
export type DensityUnit = "kg/m³";

export type ProjectStatus =
  | "draft" // rascunho, ainda não calculado
  | "valid" // pronto para calcular
  | "invalid" // possui erro impeditivo
  | "calculated" // cálculo atualizado
  | "outdated"; // projeto alterado após cálculo

export type BranchingMode =
  | "manual" // usuário informa a vazão de cada ramo
  | "percentage" // usuário informa porcentagens
  | "equal" // divisão automática igual
  | "demand"; // divisão por demanda dos destinos

export type FluidType = "water";

export type FluidProperties = {
  type: FluidType;
  name: string;
  densityKgM3: number;
  gravityMS2: number;
  specificWeightNM3: number;
};

export type UnitSettings = {
  flow: FlowUnit;
  diameter: DiameterUnit;
  length: LengthUnit;
  pressure: PressureUnit;
  head: HeadUnit;
  density: DensityUnit;
};

export type ScaleSettings = {
  // Quantos pixels representam 1 metro real.
  pixelsPerMeter: number;

  // Espaçamento visual da grade em pixels.
  gridSpacingPx: number;

  gridEnabled: boolean;
  rulerEnabled: boolean;
  snapEnabled: boolean;
};

export type ProjectHydraulicSettings = {
  fluid: FluidProperties;
  units: UnitSettings;
  scale: ScaleSettings;

  // Vazão principal padrão do projeto.
  // Pode começar nula até o usuário preencher.
  defaultFlowLps: number | null;

  // Dados geométricos gerais usados como fallback quando o editor
  // não tiver reservatório/tanque/nó de origem e destino com cotas próprias.
  originElevationM: number;
  destinationElevationM: number;

  // Pressão mínima desejada no ponto final do sistema.
  // Na Sprint 14A, ela é convertida para metros de coluna d’água
  // e entra na altura manométrica total simplificada.
  requiredOutletPressureKpa: number;

  // Bomba padrão da V1.
  defaultPumpHeadMca: number;

  // Modo padrão para tês/ramificações.
  branchingMode: BranchingMode;
};