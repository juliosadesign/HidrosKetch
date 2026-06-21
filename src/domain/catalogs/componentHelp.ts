import type { ComponentKind } from "../../types/component.types";

export type ComponentUsageGuide = {
  title: string;
  purpose: string;
  whenToUse: string;
  importantFields: string[];
  technicalNote: string;
};

const FALLBACK_GUIDES: Record<ComponentKind, ComponentUsageGuide> = {
  reservoir: {
    title: "Reservatório",
    purpose:
      "Representa uma origem ou destino de água, como poço, caixa d’água, cisterna ou reservatório aberto.",
    whenToUse:
      "Use para marcar de onde a água sai ou onde ela chega. A altura/cota desse componente ajuda no cálculo do desnível geométrico.",
    importantFields: [
      "Função no sistema: origem, destino ou intermediário.",
      "Cota ou altura em metros.",
      "Pressão superficial, quando existir.",
    ],
    technicalNote:
      "Em reservatórios abertos, a pressão superficial manométrica normalmente é considerada zero.",
  },

  tank: {
    title: "Tanque / caixa d’água",
    purpose:
      "Representa um volume de armazenamento com base, nível de água e possível pressão superior.",
    whenToUse:
      "Use quando quiser representar uma caixa d’água, tanque elevado ou reservatório com nível definido.",
    importantFields: [
      "Cota da base do tanque.",
      "Nível de água dentro do tanque.",
      "Pressão no topo, quando houver tanque pressurizado.",
    ],
    technicalNote:
      "A altura hidráulica do tanque pode considerar a cota da base somada ao nível de água informado.",
  },

  pipe: {
    title: "Tubo / cano reto",
    purpose:
      "Representa o trecho por onde a água escoa entre dois pontos do sistema.",
    whenToUse:
      "Use para desenhar o caminho da água e informar comprimento, diâmetro e material da tubulação.",
    importantFields: [
      "Diâmetro interno em milímetros.",
      "Comprimento do trecho em metros.",
      "Material da tubulação.",
    ],
    technicalNote:
      "O tubo define a geometria principal da rede. Perdas por acessórios e válvulas são tratadas nos componentes específicos.",
  },

  junction: {
    title: "Nó de conexão",
    purpose:
      "Representa um ponto de ligação, divisão ou encontro entre trechos da rede hidráulica.",
    whenToUse:
      "Use para organizar conexões, ramificações e mudanças de caminho quando a rede ficar mais complexa.",
    importantFields: [
      "Tipo de nó.",
      "Componentes conectados.",
      "Cota local, quando necessário.",
    ],
    technicalNote:
      "O nó ajuda a organizar a topologia da rede, mas não substitui um solver hidráulico completo de rede ramificada.",
  },

  accessory: {
    title: "Acessório hidráulico",
    purpose:
      "Representa peças como joelhos, curvas, tês, entradas, saídas, reduções e ampliações.",
    whenToUse:
      "Use quando existir uma peça que muda direção, entrada, saída ou geometria do escoamento.",
    importantFields: [
      "Coeficiente K da perda localizada.",
      "Diâmetro usado no cálculo.",
      "Sentido de escoamento.",
    ],
    technicalNote:
      "A perda localizada é estimada por h = K · v²/(2g). Quanto maior o K e a velocidade, maior a perda de carga.",
  },

  valve: {
    title: "Válvula",
    purpose:
      "Representa controle, bloqueio ou retenção do fluxo de água.",
    whenToUse:
      "Use para indicar registros, válvulas de gaveta, válvulas de globo ou válvulas de retenção.",
    importantFields: [
      "Tipo de válvula.",
      "Estado de abertura.",
      "Coeficiente K associado.",
    ],
    technicalNote:
      "Válvulas parcialmente fechadas podem gerar perdas muito maiores do que válvulas totalmente abertas.",
  },

  pump: {
    title: "Bomba",
    purpose:
      "Adiciona energia ao sistema para vencer altura, pressão desejada e perdas de carga.",
    whenToUse:
      "Use quando a água precisar subir para uma caixa, vencer uma pressão mínima ou compensar perdas na tubulação.",
    importantFields: [
      "Carga da bomba em mca.",
      "Sentido de escoamento.",
      "Altura manométrica que o sistema precisa vencer.",
    ],
    technicalNote:
      "Nesta versão, a bomba ainda é simplificada por carga hidráulica. Potência, consumo e catálogo real entram nas próximas sprints.",
  },

  instrument: {
    title: "Instrumento de medição",
    purpose:
      "Representa pontos de leitura, como pressão, vazão, nível ou perda de carga.",
    whenToUse:
      "Use para deixar o projeto mais didático e indicar onde uma grandeza deve ser observada.",
    importantFields: [
      "Tipo de grandeza medida.",
      "Unidade exibida.",
      "Objeto monitorado, quando informado.",
    ],
    technicalNote:
      "Os instrumentos ajudam a interpretar o projeto, mas não alteram o cálculo hidráulico principal.",
  },

  label: {
    title: "Texto anotativo",
    purpose:
      "Permite adicionar observações, nomes, lembretes e explicações diretamente na prancheta.",
    whenToUse:
      "Use para identificar trechos, indicar hipóteses, explicar simplificações ou deixar observações para apresentação.",
    importantFields: [
      "Texto da anotação.",
      "Indicação se deve aparecer ou não no relatório técnico.",
    ],
    technicalNote:
      "Anotações não interferem nos cálculos; servem para documentação e comunicação do projeto.",
  },
};

const SPECIFIC_GUIDES: Record<string, Partial<ComponentUsageGuide>> = {
  well: {
    title: "Poço",
    purpose:
      "Representa uma fonte de água abaixo ou no nível de referência do projeto.",
    whenToUse:
      "Use como origem quando a rede puxa água de um poço, cisterna ou captação inferior.",
  },

  open_reservoir: {
    title: "Reservatório aberto",
    purpose:
      "Representa um reservatório exposto à atmosfera, com pressão superficial manométrica igual a zero.",
    whenToUse:
      "Use como origem ou destino quando a água está em contato com o ar, como caixa aberta ou reservatório superior.",
  },

  pipe: {
    title: "Cano reto",
    purpose:
      "Representa um trecho simples de tubulação entre componentes.",
    whenToUse:
      "Use para desenhar o caminho da água e informar comprimento, diâmetro e material.",
  },

  elbow_90_short: {
    title: "Joelho 90°",
    purpose:
      "Representa uma mudança brusca de direção, normalmente com perda localizada maior.",
    whenToUse:
      "Use quando o tubo vira 90° com peça curta ou mudança abrupta.",
  },

  elbow_45: {
    title: "Joelho 45°",
    purpose:
      "Representa uma mudança parcial de direção no escoamento.",
    whenToUse:
      "Use quando a tubulação muda de direção com ângulo menor que 90°.",
  },

  curve_90: {
    title: "Curva 90°",
    purpose:
      "Representa uma curva mais suave que um joelho brusco, geralmente com menor perda localizada.",
    whenToUse:
      "Use quando a peça de 90° for curva longa ou mais suave.",
  },

  tee_straight: {
    title: "Tê - passagem direta",
    purpose:
      "Representa um tê em que o fluxo segue pela linha principal.",
    whenToUse:
      "Use quando existe um tê, mas o caminho analisado segue reto.",
  },

  tee_branch: {
    title: "Tê - ramificação",
    purpose:
      "Representa um tê em que o fluxo entra ou sai pela ramificação lateral.",
    whenToUse:
      "Use quando a água muda para o ramal lateral ou sai dele.",
  },

  gate_valve_open: {
    title: "Válvula de gaveta aberta",
    purpose:
      "Representa um registro com baixa perda quando está totalmente aberto.",
    whenToUse:
      "Use em redes onde existe registro de bloqueio, mas ele está aberto durante a operação.",
  },

  globe_valve_open: {
    title: "Válvula de globo aberta",
    purpose:
      "Representa uma válvula de controle com perda localizada elevada mesmo aberta.",
    whenToUse:
      "Use quando a válvula serve para controle fino de vazão ou gera perda importante.",
  },

  check_valve: {
    title: "Válvula de retenção",
    purpose:
      "Impede o retorno da água no sentido contrário.",
    whenToUse:
      "Use após bombas ou em trechos onde o refluxo precisa ser evitado.",
  },

  pressure_instrument: {
    title: "Medidor de pressão",
    purpose:
      "Marca um ponto onde a pressão deve ser observada.",
    whenToUse:
      "Use para indicar onde o usuário quer acompanhar pressão estimada ou pressão necessária.",
  },

  flow_instrument: {
    title: "Medidor de vazão",
    purpose:
      "Marca um ponto onde a vazão deve ser observada.",
    whenToUse:
      "Use para indicar trechos importantes de consumo ou controle de fluxo.",
  },

  level_instrument: {
    title: "Medidor de nível",
    purpose:
      "Marca leitura de nível em tanque, poço ou reservatório.",
    whenToUse:
      "Use para destacar cotas ou níveis que interferem no desnível geométrico.",
  },

  head_loss_instrument: {
    title: "Indicador de perda de carga",
    purpose:
      "Marca um ponto de análise de perda de carga.",
    whenToUse:
      "Use para explicar onde o sistema está perdendo energia por acessórios, válvulas ou mudanças de direção.",
  },
};

export function getComponentUsageGuide(
  catalogItemId: string | undefined,
  kind: ComponentKind
): ComponentUsageGuide {
  const fallback = FALLBACK_GUIDES[kind];
  const specific = catalogItemId ? SPECIFIC_GUIDES[catalogItemId] : undefined;

  return {
    ...fallback,
    ...specific,
    importantFields: specific?.importantFields ?? fallback.importantFields,
    technicalNote: specific?.technicalNote ?? fallback.technicalNote,
  };
}
