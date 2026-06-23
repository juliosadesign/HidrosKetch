type PdfCalculationResult = {
  warnings?: unknown[];
  errors?: unknown[];
  recommendedPump?: {
    name?: string;
    model?: string;
  };
  pumpRecommendation?: {
    name?: string;
    model?: string;
  };
  status?: string;
  mainFlowM3h?: number;
  requiredFlowM3h?: number;
  totalLocalLossMca?: number;
  totalHeadLossMca?: number;
  totalDynamicHeadMca?: number;
  electricPowerKw?: number;
  monthlyEnergyCostBRL?: number;
};

function formatNumber(value: unknown, digits = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "nao calculado";
  }

  return value.toFixed(digits);
}

function formatCurrency(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "nao calculado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAlertText(item: unknown): string {
  if (typeof item === "object" && item !== null && "message" in item) {
    return String((item as { message?: unknown }).message ?? "");
  }

  return String(item ?? "");
}

export function openTechnicalReportPdfPrint({
  projectName,
  result,
}: {
  projectName: string;
  result: unknown;
}) {
  const reportWindow = window.open(
    "",
    "_blank",
    "width=960,height=720",
  );

  if (!reportWindow) {
    throw new Error(
      "O navegador bloqueou a janela do relatorio. Permita pop-ups para gerar o PDF.",
    );
  }

  const reportResult = (result ?? {}) as PdfCalculationResult;

  const warnings = Array.isArray(reportResult.warnings)
    ? reportResult.warnings
    : [];

  const errors = Array.isArray(reportResult.errors)
    ? reportResult.errors
    : [];

  const alerts = [...errors, ...warnings];

  const pump =
    reportResult.recommendedPump?.name ??
    reportResult.recommendedPump?.model ??
    reportResult.pumpRecommendation?.name ??
    reportResult.pumpRecommendation?.model ??
    "nao calculado";

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatorio HidroSketch</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 32px;
      color: #0f172a;
      background: #ffffff;
    }

    h1 {
      color: #075985;
      margin-bottom: 4px;
    }

    h2 {
      margin-top: 28px;
      color: #0f172a;
    }

    .subtitle {
      color: #475569;
      margin-bottom: 24px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 20px 0;
    }

    .card {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 14px;
      background: #f8fafc;
    }

    .label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
    }

    .value {
      font-size: 20px;
      font-weight: 800;
      margin-top: 6px;
    }

    .note {
      border-left: 4px solid #0891b2;
      padding: 12px;
      background: #ecfeff;
      margin-top: 18px;
      color: #164e63;
    }

    button {
      border: 0;
      border-radius: 10px;
      padding: 10px 14px;
      background: #0891b2;
      color: white;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 20px;
    }

    li {
      margin-bottom: 6px;
    }

    @media print {
      button {
        display: none;
      }

      body {
        margin: 18mm;
      }
    }
  </style>
</head>
<body>
  <button onclick="window.print()">Salvar como PDF</button>

  <h1>${escapeHtml(projectName || "Projeto HidroSketch")}</h1>
  <div class="subtitle">Relatorio tecnico visual preliminar gerado pelo HidroSketch.</div>

  <div class="grid">
    <div class="card">
      <div class="label">Status</div>
      <div class="value">${escapeHtml(reportResult.status ?? "nao calculado")}</div>
    </div>

    <div class="card">
      <div class="label">Vazao</div>
      <div class="value">${formatNumber(reportResult.mainFlowM3h ?? reportResult.requiredFlowM3h)} m3/h</div>
    </div>

    <div class="card">
      <div class="label">Perda de carga</div>
      <div class="value">${formatNumber(reportResult.totalLocalLossMca ?? reportResult.totalHeadLossMca)} mca</div>
    </div>

    <div class="card">
      <div class="label">Altura manometrica total</div>
      <div class="value">${formatNumber(reportResult.totalDynamicHeadMca)} mca</div>
    </div>

    <div class="card">
      <div class="label">Potencia eletrica</div>
      <div class="value">${formatNumber(reportResult.electricPowerKw, 3)} kW</div>
    </div>

    <div class="card">
      <div class="label">Custo mensal</div>
      <div class="value">${formatCurrency(reportResult.monthlyEnergyCostBRL)}</div>
    </div>

    <div class="card">
      <div class="label">Bomba recomendada</div>
      <div class="value">${escapeHtml(pump)}</div>
    </div>
  </div>

  <h2>Alertas tecnicos</h2>
  <ul>
    ${
      alerts.length > 0
        ? alerts.map((item) => `<li>${escapeHtml(getAlertText(item))}</li>`).join("")
        : "<li>Nenhum alerta registrado.</li>"
    }
  </ul>

  <div class="note">
    Resultados baseados em modelo simplificado para fins didaticos e preliminares.
  </div>

  <script>
    window.onload = () => setTimeout(() => window.print(), 250);
  </script>
</body>
</html>`;

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
}