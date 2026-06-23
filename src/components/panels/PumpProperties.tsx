import { useMemo, useState } from "react";

import type {
  HydroFlowNode,
  UpdateSelectedNodeData,
} from "../../editor/editor.types";

type PumpPropertiesProps = {
  node: HydroFlowNode;
  onUpdate: UpdateSelectedNodeData;
};

type CurvePoint = {
  flowM3h: number;
  headMca: number;
};

function getStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getNumberValue(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "";
}

function getCurvePoints(value: unknown): CurvePoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((point) => {
      if (
        typeof point === "object" &&
        point !== null &&
        "flowM3h" in point &&
        "headMca" in point
      ) {
        const flowM3h = (point as { flowM3h?: unknown }).flowM3h;
        const headMca = (point as { headMca?: unknown }).headMca;

        if (
          typeof flowM3h === "number" &&
          Number.isFinite(flowM3h) &&
          typeof headMca === "number" &&
          Number.isFinite(headMca)
        ) {
          return { flowM3h, headMca };
        }
      }

      return null;
    })
    .filter((point): point is CurvePoint => Boolean(point));
}

function curvePointsToText(points: CurvePoint[]): string {
  return points.map((point) => `${point.flowM3h}; ${point.headMca}`).join("\n");
}

function parseCurvePointsText(value: string): CurvePoint[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [flowText, headText] = line
        .split(/[;,]/)
        .map((part) => part.trim().replace(",", "."));
      const flowM3h = Number(flowText);
      const headMca = Number(headText);

      if (!Number.isFinite(flowM3h) || !Number.isFinite(headMca)) {
        return null;
      }

      return { flowM3h, headMca };
    })
    .filter((point): point is CurvePoint => Boolean(point));
}

function FieldHelp({ children }: { children: string }) {
  return <p className="mt-1 text-[11px] leading-4 text-slate-500">{children}</p>;
}

export function PumpProperties({ node, onUpdate }: PumpPropertiesProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const data = node.data.defaultData;
  const curveText = useMemo(
    () => curvePointsToText(getCurvePoints(data.curvePoints)),
    [data.curvePoints]
  );

  function updateNumber(key: string, value: string) {
    onUpdate({ [key]: value === "" ? undefined : Number(value) });
  }

  function updateText(key: string, value: string) {
    onUpdate({ [key]: value });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">
          Propriedades da bomba
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Configure a bomba instalada ou prevista. Quando houver dados
          preenchidos, o HidroSketch usa essas informacoes na comparacao com a
          demanda do projeto.
        </p>
      </div>

      <section className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
          Dados principais
        </h3>

        <div className="mt-3 grid gap-3">
          <label className="block text-xs text-slate-300">
            Fabricante
            <input
              type="text"
              value={getStringValue(data.manufacturer)}
              onChange={(event) => updateText("manufacturer", event.target.value)}
              placeholder="Ex.: Schneider, Dancor, KSB"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-300">
            Modelo da bomba
            <input
              type="text"
              value={getStringValue(data.model)}
              onChange={(event) => updateText("model", event.target.value)}
              placeholder="Ex.: BCR-2000, CAM-W6C"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-300">
            Altura manometrica disponivel mca
            <input
              type="number"
              min="0"
              step="0.1"
              value={getNumberValue(data.availableHeadMca ?? data.headMca)}
              onChange={(event) => {
                const value = event.target.value;
                const numericValue = value === "" ? 0 : Number(value);
                onUpdate({
                  availableHeadMca: numericValue,
                  headMca: numericValue,
                });
              }}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <FieldHelp>
              Carga que a bomba consegue entregar. Este valor substitui a carga
              fixa H_b quando informado.
            </FieldHelp>
          </label>

          <label className="block text-xs text-slate-300">
            Vazao nominal m3/h
            <input
              type="number"
              min="0"
              step="0.1"
              value={getNumberValue(data.nominalFlowM3h)}
              onChange={(event) =>
                updateNumber("nominalFlowM3h", event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <FieldHelp>
              Vazao de trabalho indicada no catalogo da bomba. Ajuda na
              comparacao com a vazao exigida pela rede.
            </FieldHelp>
          </label>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setShowAdvanced((current) => !current)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
        aria-expanded={showAdvanced}
      >
        {showAdvanced ? "Ocultar campos avancados" : "Ver campos avancados"}
      </button>

      {showAdvanced && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Campos avancados
          </h3>

          <label className="block text-xs text-slate-300">
            Potencia nominal kW
            <input
              type="number"
              min="0"
              step="0.01"
              value={getNumberValue(data.nominalPowerKw ?? data.powerKw)}
              onChange={(event) => {
                const value = event.target.value;
                const numericValue = value === "" ? undefined : Number(value);
                onUpdate({
                  nominalPowerKw: numericValue,
                  powerKw: numericValue,
                });
              }}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-300">
            Eficiencia estimada %
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={getNumberValue(data.efficiencyPercent)}
              onChange={(event) =>
                updateNumber("efficiencyPercent", event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <FieldHelp>
              Usada na estimativa de potencia eletrica. Se ficar em branco, o
              sistema usa o valor padrao.
            </FieldHelp>
          </label>

          <label className="block text-xs text-slate-300">
            Tensao
            <input
              type="text"
              value={getStringValue(data.voltageV)}
              onChange={(event) => updateText("voltageV", event.target.value)}
              placeholder="Ex.: 127/220 V, 220 V trifasico"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-300">
            Curva simplificada vazao; altura
            <textarea
              rows={4}
              value={curveText}
              onChange={(event) =>
                onUpdate({ curvePoints: parseCurvePointsText(event.target.value) })
              }
              placeholder={"0; 34\n5; 25\n10; 16"}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
            <FieldHelp>
              Digite um ponto por linha no formato vazao m3/h; altura mca. A
              comparacao usa interpolacao linear quando houver pontos.
            </FieldHelp>
          </label>

          <label className="block text-xs text-slate-300">
            Observacoes da bomba
            <textarea
              rows={3}
              value={getStringValue(data.pumpNotes)}
              onChange={(event) => updateText("pumpNotes", event.target.value)}
              placeholder="Ex.: bomba escolhida para pre-dimensionamento; confirmar curva real no catalogo."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
        </section>
      )}
    </div>
  );
}
