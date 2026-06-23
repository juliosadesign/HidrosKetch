// Tipos específicos do motor matemático.
// Esses tipos são independentes da interface.

export type LocalLossComponentInput = {
    componentId: string;
    componentName: string;
    componentType: string;
  
    // Coeficiente de perda localizada.
    kValue: number;
  
    // Se o componente não informar diâmetro próprio,
    // o motor usa o defaultDiameterMm do caminho.
    diameterMm?: number;
  
    // Se o componente não informar vazão própria,
    // o motor usa o flowLps global do caminho.
    flowLps?: number;
  
    observation?: string;
  };
  
  export type PumpInput = {
    id: string;
    name: string;
    headMca: number;
    efficiencyPercent?: number;

    // Sprint 20E — dados opcionais vindos do componente Bomba.
    manufacturer?: string | null;
    model?: string | null;
    nominalFlowM3h?: number | null;
    nominalPowerKw?: number | null;
    voltageV?: string | null;
    notes?: string | null;
    curvePoints?: {
      flowM3h: number;
      headMca: number;
    }[];
  };
  
  export type HydraulicPathCalculationInput = {
    flowLps: number;
    defaultDiameterMm: number;
  
    originElevationM: number;
    destinationElevationM: number;
  
    // Pressão inicial convertida em carga, se existir.
    // Para reservatório aberto, pode ser 0.
    initialPressureHeadMca?: number;

    // Pressão mínima desejada no ponto final, já convertida para mca.
    // A Sprint 14A usa esse valor apenas no cálculo simplificado da HMT.
    requiredPressureHeadMca?: number;

    // Valor original em kPa, mantido para exibição no painel de resultados.
    requiredOutletPressureKpa?: number;

    // Sprint 14C — dados operacionais para estimativa de consumo.
    operationHoursPerDay?: number;
    operationDaysPerMonth?: number;
    energyTariffBRLKwh?: number;
  
    lossComponents: LocalLossComponentInput[];
  
    pumps: PumpInput[];
  };