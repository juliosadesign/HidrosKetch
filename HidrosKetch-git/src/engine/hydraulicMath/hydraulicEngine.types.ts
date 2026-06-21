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
  };
  
  export type HydraulicPathCalculationInput = {
    flowLps: number;
    defaultDiameterMm: number;
  
    originElevationM: number;
    destinationElevationM: number;
  
    // Pressão inicial convertida em carga, se existir.
    // Para reservatório aberto, pode ser 0.
    initialPressureHeadMca?: number;
  
    lossComponents: LocalLossComponentInput[];
  
    pumps: PumpInput[];
  };