import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

const artifactUrl = pathToFileURL(
  "C:/Users/tatya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs",
).href;

const {
  Presentation,
  PresentationFile,
  FileBlob,
  column,
  row,
  grid,
  layers,
  panel,
  text,
  image,
  shape,
  rule,
  fill,
  fixed,
  hug,
  fr,
  auto,
  grow,
  wrap,
} = await import(artifactUrl);

const W = 1920;
const H = 1080;
const FONT = "Inter";

const C = {
  navy: "#08111F",
  ink: "#101828",
  muted: "#667085",
  light: "#F5F7FA",
  line: "#DDE5EE",
  teal: "#10B981",
  tealSoft: "#DDF8EC",
  blue: "#3B82F6",
  blueSoft: "#E5F0FF",
  amber: "#F4B740",
  amberSoft: "#FFF2D1",
  red: "#EF4444",
  redSoft: "#FFE7E7",
  white: "#FFFFFF",
};

const paths = {
  output:
    "C:/Users/tatya/Downloads/Finvy_investor_pitch_reworked_11slides.pptx",
  previewDir:
    "C:/Users/tatya/AndroidStudioProjects/finmap-clone/finvy_deck_work/output/previews",
  screenshot:
    "C:/Users/tatya/AndroidStudioProjects/finmap-clone/finvy_deck_work/scratch/orig_image22.png",
  analytics:
    "C:/Users/tatya/AndroidStudioProjects/finmap-clone/mobile-analytics.png",
  qr:
    "C:/Users/tatya/AndroidStudioProjects/finmap-clone/finvy_deck_work/scratch/orig_image5.png",
};

async function asDataUrl(path, mime) {
  const data = await fs.readFile(path);
  return `data:${mime};base64,${data.toString("base64")}`;
}

const assets = {
  screenshot: await asDataUrl(paths.screenshot, "image/png"),
  qr: await asDataUrl(paths.qr, "image/png"),
};

function style(fontSize, color = C.ink, opts = {}) {
  return {
    fontFamily: FONT,
    fontSize,
    color,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
  };
}

function t(value, fontSize, color = C.ink, opts = {}) {
  return text(value, {
    name: opts.name,
    width: opts.width ?? fill,
    height: opts.height ?? hug,
    columnSpan: opts.columnSpan,
    rowSpan: opts.rowSpan,
    style: style(fontSize, color, opts),
  });
}

function bg(color = C.white) {
  return shape({ name: "background", width: fill, height: fill, fill: color });
}

function footer(source, num) {
  return row(
    { name: "footer", width: fill, height: hug, align: "center", gap: 22 },
    [
      t("Finvy | Investor pitch | 2026", 15, C.muted, {
        width: fixed(360),
      }),
      rule({ name: "footer-rule", width: fill, stroke: C.line, weight: 1 }),
      t(`${String(num).padStart(2, "0")}/11`, 15, C.muted, {
        width: fixed(58),
      }),
      t(source, 15, C.muted, { width: wrap(760) }),
    ],
  );
}

function titleStack(num, title, subtitle, dark = false) {
  return column(
    { name: "title-stack", width: fill, height: hug, gap: 13 },
    [
      row({ width: fill, height: hug, gap: 22, align: "center" }, [
        t(String(num).padStart(2, "0"), 24, dark ? C.teal : C.teal, {
          bold: true,
          width: fixed(62),
        }),
        t(title, 58, dark ? C.white : C.ink, {
          name: "slide-title",
          bold: true,
        }),
      ]),
      subtitle
        ? t(subtitle, 27, dark ? "#B8C7D9" : C.muted, {
            width: wrap(1320),
          })
        : t("", 1, dark ? C.navy : C.white, { height: fixed(1) }),
    ],
  );
}

function shell(deck, num, title, subtitle, bodyNode, source, opts = {}) {
  const slide = deck.slides.add();
  const dark = opts.bg === C.navy;
  slide.compose(
    layers({ name: `slide-${num}`, width: fill, height: fill }, [
      bg(opts.bg ?? C.white),
      grid(
        {
          name: "root",
          width: fill,
          height: fill,
          rows: [auto, fr(1), auto],
          columns: [fr(1)],
          rowGap: 28,
          padding: { x: 84, y: 54 },
        },
        [
          titleStack(num, title, subtitle, dark),
          bodyNode,
          footer(source, num),
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
  return slide;
}

function kpi(label, value, note, accent = C.blue, opts = {}) {
  return panel(
    {
      name: opts.name,
      width: fill,
      height: fill,
      padding: { x: 28, y: 24 },
      fill: opts.fill ?? C.white,
      borderRadius: 18,
    },
    column({ width: fill, height: fill, gap: 8, justify: "center" }, [
      t(label, opts.labelSize ?? 18, C.muted, { bold: true }),
      t(value, opts.valueSize ?? 52, accent, { bold: true }),
      t(note, opts.noteSize ?? 23, C.muted),
    ]),
  );
}

function chip(label, fillColor = C.tealSoft, color = C.ink) {
  return panel(
    {
      width: hug,
      height: hug,
      fill: fillColor,
      borderRadius: "rounded-full",
      padding: { x: 18, y: 9 },
    },
    t(label, 20, color, { bold: true, width: hug }),
  );
}

function processStep(label, body, accent = C.blue) {
  return row({ width: fill, height: fixed(86), align: "center", gap: 18 }, [
    panel(
      {
        width: fixed(48),
        height: fixed(48),
        fill: accent,
        borderRadius: "rounded-full",
        align: "center",
        justify: "center",
      },
      t("", 1, C.white, { width: fixed(1), height: fixed(1) }),
    ),
    column({ width: fill, height: hug, gap: 4 }, [
      t(label, 28, C.ink, { bold: true }),
      t(body, 21, C.muted),
    ]),
  ]);
}

function scenarioRow(name, time, amount, roi, color) {
  return row({ width: fill, height: fixed(64), align: "center", gap: 14 }, [
    t(name, 22, C.white, { bold: true, width: fixed(210) }),
    t(time, 21, "#B8C7D9", { width: fixed(138) }),
    t(amount, 25, color, { bold: true, width: fixed(230) }),
    t(roi, 25, color, { bold: true, width: fixed(128) }),
  ]);
}

function funnelRow(label, count, money, width, color, note) {
  return row({ width: fill, height: fixed(112), align: "center", gap: 24 }, [
    column({ width: fixed(245), height: hug, gap: 5 }, [
      t(label, 31, C.ink, { bold: true }),
      t(count, 21, C.muted),
    ]),
    shape({
      width: fixed(width),
      height: fixed(58),
      fill: color,
      borderRadius: "rounded-full",
    }),
    column({ width: fill, height: hug, gap: 4 }, [
      t(money, 35, color, { bold: true }),
      t(note, 20, C.muted),
    ]),
  ]);
}

function tableCell(value, width, opts = {}) {
  return panel(
    {
      width: width ?? fill,
      height: fill,
      padding: { x: 12, y: 11 },
      fill: opts.fill ?? "transparent",
      borderRadius: opts.radius ?? 0,
      align: opts.align ?? "start",
      justify: "center",
    },
    t(value, opts.size ?? 22, opts.color ?? C.ink, {
      bold: opts.bold ?? false,
      width: fill,
    }),
  );
}

function avatar(initial, fillColor) {
  return panel(
    {
      width: fixed(154),
      height: fixed(154),
      fill: fillColor,
      borderRadius: "rounded-full",
      align: "center",
      justify: "center",
    },
    t(initial, 64, C.white, { bold: true, width: hug }),
  );
}

function teamCard(initial, name, role, body, bgColor, accentColor) {
  return panel(
    {
      width: fill,
      height: fill,
      fill: bgColor,
      padding: { x: 30, y: 28 },
      borderRadius: 22,
      align: "center",
    },
    column({ width: fill, height: fill, gap: 14, align: "center" }, [
      avatar(initial, accentColor),
      t(name, 30, C.ink, {
        bold: true,
        width: fixed(300),
        height: fixed(78),
      }),
      t(role, 22, C.muted, {
        width: fixed(300),
        height: fixed(64),
      }),
      t(body, 20, C.ink, {
        width: fixed(300),
        height: fixed(104),
      }),
    ]),
  );
}

const deck = Presentation.create({
  slideSize: { width: W, height: H },
});

// 1. Cover / one-liner
{
  const slide = deck.slides.add();
  slide.compose(
    layers({ width: fill, height: fill }, [
      bg(C.navy),
      shape({
        name: "cover-teal-field",
        width: fixed(560),
        height: fill,
        fill: "#0D6B63",
      }),
      column(
        {
          name: "cover-root",
          width: fill,
          height: fill,
          padding: { x: 86, y: 64 },
          gap: 44,
        },
        [
          row({ width: fill, height: hug, align: "center", gap: 24 }, [
            t("Investor pitch 2026", 20, "#9FB4CB", {
              bold: true,
              width: fixed(300),
            }),
            rule({ width: fill, stroke: "#284056", weight: 1 }),
            chip("live demo", "#103B36", C.teal),
            chip("B2B KZ+", "#112A46", "#86B7FF"),
          ]),
          row({ width: fill, height: fill, gap: 76, align: "center" }, [
            column({ width: fill, height: fill, gap: 28, justify: "center" }, [
              t("Finvy", 120, C.white, { bold: true }),
              t("AI-финдиректор для МСБ Казахстана", 42, "#B8C7D9", {
                width: wrap(980),
              }),
              t(
                "Помогаем малым компаниям вести финансовый учет в период взрывного роста.",
                62,
                C.white,
                { bold: true, width: wrap(1160) },
              ),
              t(
                "Банки, наличные, P&L, налоги и AI-рекомендации собираются в одном управленческом контуре.",
                30,
                "#B8C7D9",
                { width: wrap(1180) },
              ),
              grid(
                {
                  width: wrap(1080),
                  height: fixed(132),
                  columns: [fr(1), fr(1), fr(1)],
                  columnGap: 16,
                },
                [
                  kpi("Задача", "контроль денег", "без Excel-хаоса", C.teal, {
                    fill: "#0F1C2E",
                    valueSize: 34,
                    noteSize: 20,
                  }),
                  kpi("Клиент", "ИП и ТОО", "малый бизнес KZ", C.blue, {
                    fill: "#0F1C2E",
                    valueSize: 34,
                    noteSize: 20,
                  }),
                  kpi("Контекст", "рост", "Open API и AISP", C.amber, {
                    fill: "#0F1C2E",
                    valueSize: 34,
                    noteSize: 20,
                  }),
                ],
              ),
            ]),
            column(
              {
                width: fixed(390),
                height: fill,
                gap: 20,
                align: "center",
                justify: "end",
              },
              [
                panel(
                  {
                    width: fixed(260),
                    height: fixed(260),
                    fill: C.white,
                    padding: 22,
                    borderRadius: 22,
                  },
                  image({
                    dataUrl: assets.qr,
                    width: fill,
                    height: fill,
                    fit: "contain",
                    alt: "QR code to Finvy demo",
                  }),
                ),
                t("finvy-ai.vercel.app", 25, C.white, {
                  bold: true,
                  width: hug,
                }),
                t("Раунд: $210k за 10%", 28, C.teal, {
                  bold: true,
                  width: hug,
                }),
              ],
            ),
          ]),
        ],
      ),
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

// 2. Problem
shell(
  deck,
  2,
  "МСБ теряет деньги, потому что финансы живут в разных местах",
  "Владелец видит выписки, таблицы и налоги отдельно, поэтому решения запаздывают.",
  grid(
    {
      width: fill,
      height: fill,
      rows: [fixed(178), fr(1)],
      columns: [fr(1), fr(1), fr(1)],
      columnGap: 20,
      rowGap: 30,
    },
    [
      kpi("Рынок боли", "2,3 млн+", "субъектов МСБ в РК", C.blue, {
        fill: C.blueSoft,
      }),
      kpi("Текущий учет", "~70%", "ручные таблицы и Excel", C.red, {
        fill: C.redSoft,
      }),
      kpi("Цифровой SOM", "62 000+", "уже платят за финсервисы", C.teal, {
        fill: C.tealSoft,
      }),
      panel(
        {
          width: fill,
          height: fill,
          columnSpan: 3,
          fill: C.white,
          padding: { x: 12, y: 10 },
        },
        grid(
          {
            width: fill,
            height: fill,
            columns: [fr(1), fr(1), fr(1), fr(1)],
            columnGap: 24,
          },
          [
            kpi("Банки", "разрознены", "Kaspi, Halyk, наличные", C.blue, {
              fill: "#F8FAFC",
              valueSize: 42,
            }),
            kpi("Налоги", "поздно", "штрафы и переплаты", C.red, {
              fill: "#F8FAFC",
              valueSize: 42,
            }),
            kpi("P&L", "не ежедневно", "маржа видна задним числом", C.amber, {
              fill: "#F8FAFC",
              valueSize: 42,
            }),
            kpi("AI", "без контекста", "LLM не видит историю операций", C.teal, {
              fill: "#F8FAFC",
              valueSize: 42,
            }),
          ],
        ),
      ),
    ],
  ),
  "Источник: Finvy Commercial Plan 3.0; stat.gov.kz.",
);

// 3. Solution
shell(
  deck,
  3,
  "Единая панель управления вместо таблиц и разрозненных банков",
  "Finvy собирает операции, P&L, налоги и AI-рекомендации в один ежедневный слой управления.",
  grid(
    {
      width: fill,
      height: fill,
      rows: [fr(1), fixed(168)],
      columns: [fr(1), fr(1), fr(1), fr(1)],
      columnGap: 22,
      rowGap: 26,
    },
    [
      kpi("1", "Open API / AISP", "легальный доступ к счетам и операциям", C.blue, {
        fill: C.blueSoft,
        valueSize: 38,
        labelSize: 24,
      }),
      kpi("2", "P&L + cash flow", "ежедневная управленческая картина", C.teal, {
        fill: C.tealSoft,
        valueSize: 38,
        labelSize: 24,
      }),
      kpi("3", "AI с маскированием", "рекомендации без передачи ПД в LLM", C.amber, {
        fill: C.amberSoft,
        valueSize: 38,
        labelSize: 24,
      }),
      kpi("4", "Налоги и отчеты", "сроки, напоминания, выгрузки", C.red, {
        fill: C.redSoft,
        valueSize: 38,
        labelSize: 24,
      }),
      panel(
        {
          width: fill,
          height: fill,
          columnSpan: 4,
          fill: C.navy,
          padding: { x: 38, y: 28 },
          borderRadius: 22,
        },
        row({ width: fill, height: fill, gap: 28, align: "center" }, [
          t("9 модулей уже в демо", 42, C.white, { bold: true, width: fixed(430) }),
          rule({ width: fixed(1), height: fixed(82), stroke: "#284056", weight: 2 }),
          t(
            "операции, аналитика, AI, календарь, счета, отчеты, налоги, зарплата, категории",
            30,
            "#B8C7D9",
          ),
          t("цель: AISP контур РК", 32, C.teal, {
            bold: true,
            width: fixed(360),
          }),
        ]),
      ),
    ],
  ),
  "Источник: finvy-ai.vercel.app; Finvy Commercial Plan 3.0.",
);

// 4. Product / full solution
shell(
  deck,
  4,
  "Решение целиком: от подключения данных до управленческого действия",
  "Не только интерфейс: продукт закрывает сбор данных, безопасность, аналитику, AI и продажи через доверенный контур.",
  grid(
    {
      width: fill,
      height: fill,
      columns: [fr(0.93), fr(1.07)],
      columnGap: 42,
    },
    [
      column({ width: fill, height: fill, gap: 10, justify: "center" }, [
        processStep("1. Подключение", "банки, PDF-выписки, касса и Telegram-чеки", C.blue),
        processStep("2. Нормализация", "категории, контрагенты, налоги, зарплата", C.teal),
        processStep("3. Безопасность", "VPC в РК, KMS, Keycloak, аудит ИБ", C.amber),
        processStep("4. Управление", "P&L, cash-flow, календарь налогов, отчеты", C.red),
        processStep("5. Действие", "AI объясняет риск и следующий шаг владельцу", C.navy),
      ]),
      panel(
        {
          width: fill,
          height: fill,
          fill: C.navy,
          padding: 18,
          borderRadius: 24,
        },
        image({
          dataUrl: assets.screenshot,
          width: fill,
          height: fill,
          fit: "cover",
          borderRadius: 16,
          alt: "Finvy transaction dashboard screenshot",
        }),
      ),
    ],
  ),
  "Источник: продукт Finvy; Finvy Commercial Plan 3.0.",
);

// 5. Market in money
shell(
  deck,
  5,
  "Рынок в деньгах: SOM уже 3,6 млрд ₸ годового ARR-пула",
  "Пересчет клиентов в деньги: ARPU 4 900 ₸/мес по базовой unit-экономике.",
  column({ width: fill, height: fill, gap: 28, justify: "center" }, [
    funnelRow(
      "TAM",
      "2,3 млн+ субъектов",
      "135 млрд ₸ / год",
      930,
      C.blue,
      "все ИП, ТОО и самозанятые в Казахстане",
    ),
    funnelRow(
      "SAM",
      "~620 тыс. активных",
      "36,5 млрд ₸ / год",
      560,
      C.teal,
      "МСБ, работающий с банками через Open API",
    ),
    funnelRow(
      "SOM",
      "~62 тыс. пользователей",
      "3,6 млрд ₸ / год",
      300,
      C.amber,
      "цифровые финсервисы для МСБ, первая цель",
    ),
    panel(
      {
        width: fill,
        height: fixed(134),
        fill: C.navy,
        padding: { x: 36, y: 26 },
        borderRadius: 20,
      },
      row({ width: fill, height: fill, gap: 28, align: "center" }, [
        t("Первая база к Y3", 34, C.white, { bold: true, width: fixed(370) }),
        t("5 000 клиентов", 52, C.teal, { bold: true, width: fixed(385) }),
        t("= 330 млн ₸ ARR при ARPU 5 500 ₸", 32, "#B8C7D9"),
      ]),
    ),
  ]),
  "Источник: Finvy Commercial Plan 3.0, таблица TAM/SAM/SOM и unit economics.",
);

// 6. Business model
shell(
  deck,
  6,
  "B2B SaaS: подписка сегодня, enterprise-upside после Open API",
  "Монетизация строится на регулярной подписке, затем расширяется корпоративными интеграциями и партнерскими программами.",
  column({ width: fill, height: fill, gap: 28, justify: "center" },
    [
      row({ width: fill, height: fixed(300), gap: 18 }, [
        kpi("Personal AI", "1 490 ₸", "физлица, фрилансеры", C.muted, {
          fill: "#F8FAFC",
          valueSize: 42,
          noteSize: 21,
        }),
        kpi("Starter", "3 800 ₸", "микробизнес и ИП", C.blue, {
          fill: C.blueSoft,
          valueSize: 42,
          noteSize: 21,
        }),
        kpi("Business", "5 990 ₸", "малый бизнес и ТОО", C.teal, {
          fill: C.tealSoft,
          valueSize: 42,
          noteSize: 21,
        }),
        kpi("Corporate", "от 30 000 ₸", "кастом и интеграции", C.amber, {
          fill: C.amberSoft,
          valueSize: 39,
          noteSize: 21,
        }),
      ]),
      panel(
        {
          width: fill,
          height: fixed(230),
          fill: C.navy,
          padding: { x: 34, y: 26 },
          borderRadius: 22,
        },
        row(
          {
            width: fill,
            height: fill,
            gap: 24,
          },
          [
            kpi("Средний чек mix B2B", "4 900 ₸", "ARPU в финмодели", C.teal, {
              fill: "#0F1C2E",
              valueSize: 36,
              noteSize: 20,
            }),
            kpi("Gross margin", "65%", "после AI API и инфраструктуры", C.blue, {
              fill: "#0F1C2E",
              valueSize: 36,
              noteSize: 20,
            }),
            kpi("Enterprise upside", "custom", "роли, отчеты, интеграции", C.amber, {
              fill: "#0F1C2E",
              valueSize: 36,
              noteSize: 20,
            }),
          ],
        ),
      ),
    ],
  ),
  "Источник: Finvy Commercial Plan 3.0, тарифы и unit economics.",
);

// 7. Traction + investor outcome
shell(
  deck,
  7,
  "Инвестор получает 10% доли и понятные сценарии возврата",
  "По финмодели: выход через M&A/Series A или дивиденды после break-even M16-M18.",
  grid(
    {
      width: fill,
      height: fill,
      columns: [fr(0.85), fr(1.35)],
      columnGap: 36,
    },
    [
      column({ width: fill, height: fill, gap: 18, justify: "center" }, [
        kpi("Раунд", "$210k", "105 млн ₸ за 10%", C.teal, {
          fill: C.tealSoft,
          valueSize: 48,
        }),
        kpi("M18 цель", "3 000+ клиентов", "ARR ≈ 200 млн ₸", C.blue, {
          fill: C.blueSoft,
          valueSize: 42,
        }),
        kpi("Series A ready", "$1-3M", "после AISP и роста продаж", C.amber, {
          fill: C.amberSoft,
          valueSize: 42,
        }),
      ]),
      panel(
        {
          width: fill,
          height: fill,
          fill: C.navy,
          padding: { x: 34, y: 30 },
          borderRadius: 24,
        },
        column({ width: fill, height: fill, gap: 15, justify: "center" }, [
          t("Сколько и через сколько", 38, C.white, { bold: true }),
          t(
            "Расчет для инвестора с 10% доли. Значения ниже - прогнозные сценарии из commercial plan.",
            23,
            "#B8C7D9",
          ),
          rule({ width: fill, stroke: "#284056", weight: 2 }),
          row({ width: fill, height: fixed(44), gap: 14, align: "center" }, [
            t("Сценарий", 18, "#7F93AD", { bold: true, width: fixed(210) }),
            t("Срок", 18, "#7F93AD", { bold: true, width: fixed(138) }),
            t("Доля 10%", 18, "#7F93AD", { bold: true, width: fixed(230) }),
            t("ROI", 18, "#7F93AD", { bold: true, width: fixed(128) }),
          ]),
          scenarioRow("Консервативный", "3 года", "200 млн ₸", "×1,9", C.blue),
          scenarioRow("Базовый", "3,5 года", "720 млн ₸", "×6,9", C.teal),
          scenarioRow("Оптимистичный", "5 лет", "1,75 млрд ₸", "×16,7", C.amber),
          rule({ width: fill, stroke: "#284056", weight: 1 }),
          scenarioRow("Дивиденды", "с M18/Y3", "~30 млн ₸/год", "3-4 г.", C.teal),
          t(
            "Плюс: pro-rata права на следующий раунд и observer seat без права голоса.",
            23,
            "#B8C7D9",
          ),
        ]),
      ),
    ],
  ),
  "Источник: Finvy Commercial Plan 3.0, разделы roadmap и investor return.",
);

// 8. Unit economics
shell(
  deck,
  8,
  "Юнит-экономика: CAC окупается за 2,5 месяца",
  "Одной цены подписки мало: экономика сходится за счет высокой маржи, низкого CAC и короткого payback.",
  column({ width: fill, height: fill, gap: 24, justify: "center" },
    [
      grid(
        {
          width: fill,
          height: fixed(410),
          rows: [fixed(195), fixed(195)],
          columns: [fr(1), fr(1), fr(1)],
          columnGap: 20,
          rowGap: 20,
        },
        [
          kpi("ARPU", "4 900 ₸", "средний чек mix B2B", C.blue, {
            fill: C.blueSoft,
          }),
          kpi("Gross margin", "65%", "валовая маржа SaaS", C.teal, {
            fill: C.tealSoft,
          }),
          kpi("Contribution", "3 185 ₸", "ARPU × margin", C.amber, {
            fill: C.amberSoft,
          }),
          kpi("CAC", "8 000 ₸", "стоимость привлечения", C.red, {
            fill: C.redSoft,
          }),
          kpi("LTV", "105 000 ₸", "при churn 3%/мес", C.blue, {
            fill: "#F8FAFC",
          }),
          kpi("LTV / CAC", "×13", "выше SaaS-нормы ×3-5", C.teal, {
            fill: "#F8FAFC",
          }),
        ],
      ),
      panel(
        {
          width: fill,
          height: fixed(176),
          fill: C.navy,
          padding: { x: 42, y: 30 },
          borderRadius: 22,
        },
        row({ width: fill, height: fill, gap: 32, align: "center" }, [
          t("Точка безубыточности", 36, C.white, {
            bold: true,
            width: fixed(420),
          }),
          t("~790", 72, C.teal, { bold: true, width: fixed(190) }),
          t("платящих пользователей", 35, C.white, {
            bold: true,
            width: fixed(410),
          }),
          t("при OPEX ~2,5 млн ₸/мес и contribution 3 185 ₸", 25, "#B8C7D9"),
        ]),
      ),
    ],
  ),
  "Источник: Finvy Commercial Plan 3.0, unit economics и OPEX.",
);

// 9. Competition
const competitors = [
  ["Критерий", "Excel", "1C / бух.", "Банки", "Expense apps", "Finvy"],
  ["Единое окно по счетам", "-", "-", "частично", "частично", "✓"],
  ["P&L и cash flow ежедневно", "-", "частично", "-", "частично", "✓"],
  ["AI-инсайты по операциям", "-", "-", "-", "частично", "✓"],
  ["Налоги и сроки", "ручн.", "✓", "-", "-", "✓"],
  ["Open API roadmap", "-", "частично", "✓", "частично", "✓"],
];

shell(
  deck,
  9,
  "Finvy — операционный слой поверх банков и бухгалтерии",
  "Не заменяем учет и банки, а даем владельцу ежедневное решение: что происходит с деньгами и что делать дальше.",
  column({ width: fill, height: fill, gap: 18, justify: "center" }, [
    ...competitors.map((r, idx) =>
      grid(
        {
          width: fill,
          height: fixed(idx === 0 ? 62 : 74),
          columns: [fr(1.55), fr(0.72), fr(0.78), fr(0.72), fr(0.9), fr(0.72)],
          columnGap: 7,
        },
        r.map((cell, ci) =>
          tableCell(cell, fill, {
            fill:
              idx === 0
                ? C.navy
                : ci === 5
                  ? C.tealSoft
                  : idx % 2 === 0
                    ? "#F8FAFC"
                    : C.white,
            color: idx === 0 ? C.white : ci === 5 ? "#046C4E" : C.ink,
            bold: idx === 0 || ci === 0 || ci === 5,
            size: idx === 0 ? 21 : ci === 0 ? 23 : 22,
            radius: idx === 0 || ci === 5 ? 12 : 0,
            align: ci === 0 ? "start" : "center",
          }),
        ),
      ),
    ),
    panel(
      {
        width: fill,
        height: fixed(108),
        fill: C.blueSoft,
        padding: { x: 28, y: 22 },
        borderRadius: 18,
      },
      t(
        "Отличие: Finvy превращает банковские данные и бухгалтерские факты в ежедневные действия для собственника.",
        31,
        C.ink,
        { bold: true },
      ),
    ),
  ]),
  "Источник: продуктовая карта Finvy; Finvy Commercial Plan 3.0.",
);

// 10. Team
shell(
  deck,
  10,
  "Команда: основательница сейчас, ключевые роли закрываются раундом",
  "Текущий founder + найм Backend, Product, Sales и Compliance из бюджета раунда.",
  grid(
    {
      width: fill,
      height: fill,
      rows: [fr(1), fixed(136)],
      columns: [fr(1), fr(1), fr(1), fr(1)],
      columnGap: 20,
      rowGap: 24,
    },
    [
      teamCard(
        "Т",
        "Татьяна",
        "Founder / Product & Tech Lead",
        "видение продукта, UX, первые пилоты",
        C.tealSoft,
        C.teal,
      ),
      teamCard(
        "BE",
        "Backend Lead",
        "DevOps / ИБ, старт M1",
        "Kubernetes, VPC, Keycloak, mTLS, AISP",
        C.blueSoft,
        C.blue,
      ),
      teamCard(
        "PM",
        "Product Manager",
        "UX / метрики, старт M1",
        "customer development, сценарии, удержание",
        C.amberSoft,
        C.amber,
      ),
      teamCard(
        "S",
        "Sales B2B",
        "партнерства, старт M3",
        "воронка МСБ, бухгалтеры, банки, регионы",
        "#F2F4F7",
        C.red,
      ),
      panel(
        {
          columnSpan: 4,
          width: fill,
          height: fill,
          fill: C.navy,
          padding: { x: 34, y: 24 },
          borderRadius: 20,
        },
        row({ width: fill, height: fill, gap: 30, align: "center" }, [
          t("План команды после раунда", 34, C.white, {
            bold: true,
            width: fixed(520),
          }),
          t("6 человек", 50, C.teal, { bold: true, width: fixed(240) }),
          t("ФОТ 62,46 млн ₸ на 18 месяцев", 31, "#B8C7D9"),
        ]),
      ),
    ],
  ),
  "Источник: Finvy Commercial Plan 3.0, раздел команды и ФОТ.",
);

// 11. Ask
shell(
  deck,
  11,
  "Ask: $210k за 10%, чтобы пройти compliance и масштабировать продажи",
  "Раунд закрывает 18 месяцев: команда, инфраструктура в РК, ИБ, маркетинг и резерв.",
  grid(
    {
      width: fill,
      height: fill,
      columns: [fr(1.05), fr(0.95)],
      columnGap: 40,
    },
    [
      column({ width: fill, height: fill, gap: 16, justify: "center" }, [
        kpi("Раунд", "$210 000", "105 млн ₸, 10% equity / SAFE cap $2,1M", C.teal, {
          fill: C.tealSoft,
          valueSize: 58,
        }),
        ...[
          ["ФОТ", "60,6%", C.blue],
          ["Операционка", "13,2%", C.teal],
          ["Резерв", "11,5%", C.amber],
          ["Маркетинг", "7,9%", C.red],
          ["Compliance + CAPEX", "6,8%", C.muted],
        ].map(([label, pct, color]) =>
          row({ width: fill, height: fixed(56), gap: 18, align: "center" }, [
            t(label, 25, C.ink, { bold: true, width: fixed(270) }),
            shape({
              width: fixed(Math.round(430 * (parseFloat(pct) / 65))),
              height: fixed(24),
              fill: color,
              borderRadius: "rounded-full",
            }),
            t(pct, 25, color, { bold: true, width: fixed(110) }),
          ]),
        ),
      ]),
      column({ width: fill, height: fill, gap: 22, justify: "center" }, [
        panel(
          {
            width: fill,
            height: fixed(390),
            fill: C.navy,
            padding: { x: 32, y: 30 },
            borderRadius: 24,
          },
          column({ width: fill, height: fill, gap: 18 }, [
            t("Вехи раунда", 36, C.white, { bold: true }),
            t("AISP / Open API контур live", 29, C.teal, { bold: true }),
            t("3 000 платящих клиентов к M18", 29, C.white, { bold: true }),
            t("ARR ≈ 200 млн ₸", 29, C.white, { bold: true }),
            t("EBITDA-positive с M16-M18", 29, C.white, { bold: true }),
            t("Готовность к Series A $1-3M", 29, C.amber, { bold: true }),
          ]),
        ),
        row({ width: fill, height: fixed(190), gap: 24, align: "center" }, [
          panel(
            {
              width: fixed(168),
              height: fixed(168),
              fill: C.white,
              padding: 14,
              borderRadius: 18,
            },
            image({
              dataUrl: assets.qr,
              width: fill,
              height: fill,
              fit: "contain",
              alt: "QR code to Finvy demo",
            }),
          ),
          column({ width: fill, height: hug, gap: 8 }, [
            t("Live demo", 34, C.ink, { bold: true }),
            t("finvy-ai.vercel.app", 28, C.blue, { bold: true }),
            t("tatyanawaves@gmail.com", 25, C.muted),
          ]),
        ]),
      ]),
    ],
  ),
  "Источник: Finvy Commercial Plan 3.0, бюджет и условия сделки.",
);

await fs.mkdir(paths.previewDir, { recursive: true });

for (let i = 0; i < deck.slides.count; i += 1) {
  try {
    await deck.slides.getItem(i).export({ format: "png" });
  } catch (err) {
    console.error(`Pre-export render failed on slide ${i + 1}`);
    throw err;
  }
}

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(paths.output);

const saved = await FileBlob.load(paths.output);
const imported = await PresentationFile.importPptx(saved);

for (let i = 0; i < imported.slides.count; i += 1) {
  const png = await imported.slides.getItem(i).export({ format: "png" });
  await fs.writeFile(
    `${paths.previewDir}/slide_${String(i + 1).padStart(2, "0")}.png`,
    Buffer.from(await png.arrayBuffer()),
  );
}

console.log(JSON.stringify({ output: paths.output, previews: paths.previewDir, slides: imported.slides.count }, null, 2));
