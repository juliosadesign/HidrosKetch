// Funções relacionadas à bomba.
// Na V1, a bomba entra de forma simplificada por carga fixa H_b.

export type PumpHeadInput = {
    id: string;
    name: string;
    headMca: number;
  };
  
  export function sumPumpHeadsMca(pumps: PumpHeadInput[]): number {
    return pumps.reduce((total, pump) => {
      if (pump.headMca < 0) {
        throw new Error(`A carga da bomba "${pump.name}" não pode ser negativa.`);
      }
  
      return total + pump.headMca;
    }, 0);
  }