import { runHydraulicPathCalculation } from "./hydraulicEngine";

// Teste manual da V1.
// Este arquivo roda fora da interface.
// Para executar:
//
// npm run test:math

function round(value: number | null, decimals = 4): string {
  if (value === null) return "null";

  return value.toFixed(decimals);
}

const result = runHydraulicPathCalculation({
  flowLps: 2,
  defaultDiameterMm: 50,

  originElevationM: 0,
  destinationElevationM: 5,

  // Reservatório aberto em pressão manométrica.
  initialPressureHeadMca: 0,

  pumps: [
    {
      id: "P01",
      name: "Bomba padrão",
      headMca: 10,
    },
  ],

  lossComponents: [
    {
      componentId: "A01",
      componentName: "Entrada de tubulação",
      componentType: "accessory",
      kValue: 0.5,
    },
    {
      componentId: "A02",
      componentName: "Joelho 90° raio curto",
      componentType: "accessory",
      kValue: 0.9,
    },
    {
      componentId: "V01",
      componentName: "Válvula de gaveta aberta",
      componentType: "valve",
      kValue: 0.2,
    },
    {
      componentId: "A03",
      componentName: "Tê - passagem direta",
      componentType: "accessory",
      kValue: 0.6,
    },
    {
      componentId: "A04",
      componentName: "Saída de tubulação",
      componentType: "accessory",
      kValue: 1.0,
    },
  ],
});

console.log("\n=== TESTE PADRÃO HIDROSKETCH V1 ===\n");

console.log("Status:", result.status);

console.log("\nResultados gerais:");
console.table({
  "Perda localizada total (mca)": round(result.totalLocalLossMca),
  "Carga total da bomba (mca)": round(result.totalPumpHeadMca),
  "Carga residual (mca)": round(result.residualHeadMca),
  "Pressão estimada (kPa)": round(result.estimatedPressureKpa),
});

console.log("\nResultados por componente:");
console.table(
  result.componentResults.map((item) => ({
    componente: item.componentName,
    K: item.kValue,
    diametro_mm: item.diameterMm,
    vazao_Ls: item.flowLps,
    area_m2: round(item.areaM2 ?? null, 7),
    velocidade_ms: round(item.velocityMs ?? null, 4),
    carga_cinetica_m: round(item.kineticHeadM ?? null, 5),
    perda_mca: round(item.localLossMca ?? null, 5),
  }))
);

console.log("\nValores esperados aproximados:");
console.table({
  "Área": "0.0019635 m²",
  "Velocidade": "1.0186 m/s",
  "Carga cinética": "0.05286 m",
  "Perda localizada total": "0.1691 mca",
  "Carga residual": "4.8309 mca",
  "Pressão estimada": "47.38 kPa",
});

if (result.errors.length > 0) {
  console.log("\nErros:");
  console.table(result.errors);
}

if (result.warnings.length > 0) {
  console.log("\nAlertas:");
  console.table(result.warnings);
}