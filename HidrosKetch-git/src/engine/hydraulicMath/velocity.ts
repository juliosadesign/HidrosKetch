// Funções relacionadas à velocidade do escoamento.

export function calculateVelocityMs(flowM3s: number, areaM2: number): number {
    if (flowM3s < 0) {
      throw new Error("A vazão não pode ser negativa.");
    }
  
    if (areaM2 <= 0) {
      throw new Error("A área deve ser maior que zero.");
    }
  
    return flowM3s / areaM2;
  }