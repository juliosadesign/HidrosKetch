// Funções puras de conversão de unidades.
// Essas funções não dependem de React, interface ou estado global.

export function litersPerSecondToCubicMetersPerSecond(flowLps: number): number {
    if (flowLps < 0) {
      throw new Error("A vazão não pode ser negativa.");
    }
  
    return flowLps / 1000;
  }
  
  export function millimetersToMeters(valueMm: number): number {
    if (valueMm <= 0) {
      throw new Error("O valor em milímetros deve ser maior que zero.");
    }
  
    return valueMm / 1000;
  }
  
  export function pascalToKilopascal(valuePa: number): number {
    return valuePa / 1000;
  }
  
  export function metersOfWaterColumnToKilopascal(headMca: number): number {
    // 1 mca ≈ 9,81 kPa para água em condições comuns.
    return headMca * 9.81;
  }