// Funções geométricas usadas no cálculo hidráulico.

export function calculateCircularAreaM2(diameterM: number): number {
    if (diameterM <= 0) {
      throw new Error("O diâmetro deve ser maior que zero.");
    }
  
    return (Math.PI * Math.pow(diameterM, 2)) / 4;
  }