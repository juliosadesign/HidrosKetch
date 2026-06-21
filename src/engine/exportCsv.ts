import {
  buildPumpRecommendations,
  getRecommendedPump,
} from "./pumpSelection";
import type { PumpRecommendationStatus } from "../types/pump.types";
import type { HydroCalculationResult } from "../types/result.types";

type CsvRow = Array<string | number | null | undefined>;

const CSV_SEPARATOR = ";";
const SIMPLIFICATION_NOTE =
  "Resultados baseados em modelo simplificado para fins didáticos e preliminares.";

export function buildCalculationCsv(result: HydroCalculationResult): string {
  const requiredFlowM3h = resolveRequiredFlowM3h(result);
  const recommendations = buildPumpRecommendations({
    requiredFlowM3h,
    requiredHeadMca: result.totalDynamicHeadMca,
    estimatedElectricPowerKw: result.electricPowerKw,
    assumedEfficiencyPercent: result.pumpEfficiencyPercent,
  });
  const recommendedPump = getRecommendedPump(recommendations);

  const rows: CsvRow[] = [
    ["Seção", "Campo", "Valor", "Unidade", "Observação"],
    ["Observação", "Nota técnica", SIMPLIFICATION_NOTE, "", ""],
    [
      "Projeto",
      "Data do cálculo",
      result.calculatedAt ?? "não calculado",
      "",
      "Data gerada pelo último cálculo confirmado.",
    ],
    ["Altura e carga", "Altura da origem", result.originElevationM, "m", ""],
    [
      "Altura e carga",
      "Altura do destino",
      result.destinationElevationM,
      "m",
      "",
    ],
    [
      "Altura e carga",
      "Desnível geométrico",
      result.geometricHeadM,
      "m",
      "Destino - origem.",
    ],
    [
      "Altura e carga",
      "Perda de carga total",
      result.totalLocalLossMca,
      "mca",
      "Soma simplificada das perdas localizadas calculadas.",
    ],
    [
      "Altura e carga",
      "Pressão mínima desejada",
      result.requiredOutletPressureKpa,
      "kPa",
      "Campo técnico do projeto.",
    ],
    [
      "Altura e carga",
      "Carga da pressão desejada",
      result.requiredPressureHeadMca,
      "mca",
      "Pressão mínima convertida em metros de coluna d’água.",
    ],
    [
      "Altura e carga",
      "Altura manométrica total estimada",
      result.totalDynamicHeadMca,
      "mca",
      "Desnível + perdas + pressão mínima convertida.",
    ],
    [
      "Bomba instalada",
      "Carga total da bomba instalada",
      result.totalPumpHeadMca,
      "mca",
      "Soma das cargas de bomba informadas no editor.",
    ],
    [
      "Bomba instalada",
      "Carga residual",
      result.residualHeadMca,
      "mca",
      "Carga disponível após perdas no modelo simplificado.",
    ],
    [
      "Bomba instalada",
      "Pressão estimada",
      result.estimatedPressureKpa,
      "kPa",
      "Pressão estimada a partir da carga residual.",
    ],
    ["Energia", "Potência hidráulica", result.hydraulicPowerKw, "kW", ""],
    [
      "Energia",
      "Potência hidráulica",
      result.hydraulicPowerW,
      "W",
      "Mesma potência hidráulica convertida para watts.",
    ],
    [
      "Energia",
      "Potência elétrica estimada",
      result.electricPowerKw,
      "kW",
      "Potência hidráulica dividida pela eficiência usada.",
    ],
    [
      "Energia",
      "Eficiência usada",
      result.pumpEfficiencyPercent,
      "%",
      "Valor informado ou padrão estimado.",
    ],
    [
      "Energia",
      "Horas de uso por dia",
      result.operationHoursPerDay,
      "h/dia",
      "",
    ],
    [
      "Energia",
      "Dias de uso por mês",
      result.operationDaysPerMonth,
      "dias/mês",
      "",
    ],
    [
      "Energia",
      "Tarifa de energia",
      result.energyTariffBRLKwh,
      "R$/kWh",
      "",
    ],
    ["Energia", "Consumo diário", result.dailyConsumptionKwh, "kWh", ""],
    ["Energia", "Consumo mensal", result.monthlyConsumptionKwh, "kWh", ""],
    [
      "Energia",
      "Custo mensal estimado",
      result.monthlyEnergyCostBRL,
      "R$",
      "Estimativa com base em potência elétrica, tempo de uso e tarifa.",
    ],
    [
      "Recomendação de bomba",
      "Bomba recomendada",
      recommendedPump
        ? `${recommendedPump.pump.brand} ${recommendedPump.pump.model}`
        : "não informado",
      "",
      "Pré-seleção simplificada pelo catálogo interno.",
    ],
    [
      "Recomendação de bomba",
      "Status da bomba",
      recommendedPump ? getPumpStatusLabel(recommendedPump.status) : "não calculado",
      "",
      "Não substitui dimensionamento com curva real da bomba e curva do sistema.",
    ],
    [
      "Recomendação de bomba",
      "Vazão exigida",
      requiredFlowM3h,
      "m³/h",
      "Convertida a partir da vazão em L/s do primeiro componente calculado.",
    ],
    [
      "Recomendação de bomba",
      "Altura entregue pela curva",
      recommendedPump?.curveEvaluation.deliveredHeadMca ?? null,
      "mca",
      "Quando houver curva simplificada cadastrada.",
    ],
    [
      "Recomendação de bomba",
      "Margem pela curva",
      recommendedPump?.curveEvaluation.headMarginMca ?? null,
      "mca",
      "Altura entregue - altura exigida.",
    ],
  ];

  rows.push(["", "", "", "", ""]);
  rows.push(["Componentes", "Nome", "Tipo", "Valor", "Observação"]);

  result.componentResults.forEach((component) => {
    rows.push([
      "Componentes",
      component.componentName,
      component.componentType,
      formatComponentValue(component.localLossMca, "mca"),
      component.observation ?? "",
    ]);
  });

  if (result.warnings.length > 0) {
    rows.push(["", "", "", "", ""]);
    rows.push(["Alertas", "Mensagem", "Componente", "", ""]);

    result.warnings.forEach((warning) => {
      rows.push([
        "Alertas",
        warning.message,
        warning.componentId ?? "não informado",
        "",
        "",
      ]);
    });
  }

  if (result.assumptions.length > 0) {
    rows.push(["", "", "", "", ""]);
    rows.push(["Hipóteses", "Mensagem", "", "", ""]);

    result.assumptions.forEach((assumption) => {
      rows.push(["Hipóteses", assumption, "", "", ""]);
    });
  }

  return rows.map(formatCsvRow).join("\n");
}

export function downloadCalculationCsv(result: HydroCalculationResult): void {
  const csv = buildCalculationCsv(result);
  const fileName = buildCsvFileName(result.calculatedAt);
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function resolveRequiredFlowM3h(result: HydroCalculationResult): number | null {
  const flowLps = result.componentResults.find(
    (component) => typeof component.flowLps === "number" && component.flowLps > 0
  )?.flowLps;

  if (!flowLps) {
    return null;
  }

  return flowLps * 3.6;
}

function getPumpStatusLabel(status: PumpRecommendationStatus): string {
  const labels: Record<PumpRecommendationStatus, string> = {
    atende: "atende",
    atende_com_folga: "atende com folga",
    insuficiente: "insuficiente",
    superdimensionada: "superdimensionada",
    dados_incompletos: "dados incompletos",
  };

  return labels[status];
}

function formatComponentValue(
  value: number | null | undefined,
  unit: string
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "não calculado";
  }

  return `${value.toFixed(4)} ${unit}`;
}

function formatCsvRow(row: CsvRow): string {
  return row.map(formatCsvCell).join(CSV_SEPARATOR);
}

function formatCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const normalizedValue =
    typeof value === "number" && Number.isFinite(value)
      ? value.toString().replace(".", ",")
      : String(value);

  return `"${normalizedValue.replace(/"/g, '""')}"`;
}

function buildCsvFileName(calculatedAt: string | null): string {
  const date = calculatedAt ? new Date(calculatedAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "hidrosketch-relatorio-tecnico.csv";
  }

  const stamp = date.toISOString().slice(0, 19).replace(/[:T]/g, "-");

  return `hidrosketch-relatorio-tecnico-${stamp}.csv`;
}
