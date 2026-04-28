// Demo data: typical business in Ust-Kamenogorsk (construction materials + installation)

const now = new Date()
const d = (daysAgo) => {
  const dt = new Date(now)
  dt.setDate(dt.getDate() - daysAgo)
  return dt.toISOString().slice(0, 10)
}

export const DEMO_ACCOUNTS = [
  { id: 'demo-1', name: 'Kaspi Business', type: 'bank', currency: 'KZT', balance: 2_340_000 },
  { id: 'demo-2', name: 'Halyk Bank ВКО', type: 'bank', currency: 'KZT', balance: 1_120_000 },
  { id: 'demo-3', name: 'Наличные',       type: 'cash', currency: 'KZT', balance: 185_000 },
]

export const DEMO_TRANSACTIONS = [
  // ─── Income ───
  { id: 'd1',  user_id: 'demo', type: 'income',  amount: 1_850_000, description: 'ТОО «Иртыш Строй» — профнастил + металлочерепица', category: 'Продажи', accountId: 'demo-1', date: d(1) },
  { id: 'd2',  user_id: 'demo', type: 'income',  amount: 420_000,   description: 'ИП Жумабаев К. — монтаж кровли, пос. Меновное',    category: 'Услуги',  accountId: 'demo-1', date: d(2) },
  { id: 'd3',  user_id: 'demo', type: 'income',  amount: 1_200_000, description: 'ТОО «ВК-Регион» — партия утеплителя',              category: 'Продажи', accountId: 'demo-2', date: d(5) },
  { id: 'd4',  user_id: 'demo', type: 'income',  amount: 380_000,   description: 'ИП Токтаров С. — установка ворот, Аблакетка',      category: 'Услуги',  accountId: 'demo-1', date: d(7) },
  { id: 'd5',  user_id: 'demo', type: 'income',  amount: 760_000,   description: 'КГУ «Школа №38» — ремонт фасада (госзакупки)',     category: 'Продажи', accountId: 'demo-2', date: d(10) },
  { id: 'd6',  user_id: 'demo', type: 'income',  amount: 95_000,    description: 'Возврат от ТОО «Алтай Снаб» за пересортицу',       category: 'Возврат', accountId: 'demo-1', date: d(13) },
  { id: 'd7',  user_id: 'demo', type: 'income',  amount: 540_000,   description: 'ИП Муканова Д. — окна ПВХ, 12 шт',                 category: 'Продажи', accountId: 'demo-1', date: d(16) },
  { id: 'd8',  user_id: 'demo', type: 'income',  amount: 650_000,   description: 'ТОО «Риддер-Комфорт» — доставка стройматериалов',  category: 'Услуги',  accountId: 'demo-2', date: d(19) },
  { id: 'd9',  user_id: 'demo', type: 'income',  amount: 180_000,   description: 'Частный заказ — забор из профлиста, Согра',         category: 'Услуги',  accountId: 'demo-3', date: d(22) },
  { id: 'd10', user_id: 'demo', type: 'income',  amount: 320_000,   description: 'Субсидия «Даму» — компенсация % по кредиту',       category: 'Субсидия', accountId: 'demo-2', date: d(26) },

  // ─── Previous month income (for comparison) ───
  { id: 'd50', user_id: 'demo', type: 'income',  amount: 1_600_000, description: 'ТОО «Иртыш Строй» — сайдинг + водосток',          category: 'Продажи', accountId: 'demo-1', date: d(35) },
  { id: 'd51', user_id: 'demo', type: 'income',  amount: 900_000,   description: 'ТОО «Шыгыс Курылыс» — перегородки ГКЛ',           category: 'Продажи', accountId: 'demo-2', date: d(40) },
  { id: 'd52', user_id: 'demo', type: 'income',  amount: 350_000,   description: 'ИП Кенжегалиев — монтаж забора',                   category: 'Услуги',  accountId: 'demo-1', date: d(45) },
  { id: 'd53', user_id: 'demo', type: 'income',  amount: 480_000,   description: 'ТОО «Семей-Строй» — доставка',                     category: 'Услуги',  accountId: 'demo-2', date: d(50) },

  // ─── Expenses ───
  // Salary (3 employees)
  { id: 'd11', user_id: 'demo', type: 'expense', amount: 280_000,   description: 'Зарплата — Ерлан, менеджер по продажам',         category: 'Зарплата',  accountId: 'demo-2', date: d(1) },
  { id: 'd12', user_id: 'demo', type: 'expense', amount: 220_000,   description: 'Зарплата — Асхат, монтажник',                    category: 'Зарплата',  accountId: 'demo-2', date: d(1) },
  { id: 'd13', user_id: 'demo', type: 'expense', amount: 200_000,   description: 'Зарплата — Марат, водитель-экспедитор',          category: 'Зарплата',  accountId: 'demo-2', date: d(1) },

  // Taxes
  { id: 'd14', user_id: 'demo', type: 'expense', amount: 210_000,   description: 'ОПВ + СО + ОСМС за 3 сотрудников (март)',        category: 'Налоги',    accountId: 'demo-2', date: d(2) },
  { id: 'd15', user_id: 'demo', type: 'expense', amount: 162_000,   description: 'ИПН + соц. налог за март',                       category: 'Налоги',    accountId: 'demo-2', date: d(2) },

  // Rent
  { id: 'd16', user_id: 'demo', type: 'expense', amount: 250_000,   description: 'Аренда склад + офис, ул. Кабанбай батыра 122',   category: 'Аренда',    accountId: 'demo-2', date: d(3) },

  // Procurement
  { id: 'd17', user_id: 'demo', type: 'expense', amount: 1_350_000, description: 'ТОО «Алтай Снаб» — профлист С-8, утеплитель',    category: 'Закуп товаров', accountId: 'demo-1', date: d(4) },
  { id: 'd18', user_id: 'demo', type: 'expense', amount: 480_000,   description: 'ТОО «СтройОпт НС» — окна ПВХ, фурнитура',       category: 'Закуп товаров', accountId: 'demo-1', date: d(11) },
  { id: 'd19', user_id: 'demo', type: 'expense', amount: 290_000,   description: 'Kaspi Магазин — крепёж, герметики, инструмент',   category: 'Закуп товаров', accountId: 'demo-1', date: d(18) },

  // Logistics + Fuel
  { id: 'd20', user_id: 'demo', type: 'expense', amount: 120_000,   description: 'Доставка из Алматы — транспортная «КазГрузАвто»', category: 'Логистика', accountId: 'demo-1', date: d(5) },
  { id: 'd21', user_id: 'demo', type: 'expense', amount: 85_000,    description: 'Газпром нефть — дизель Газель + бензин Duster',   category: 'ГСМ',       accountId: 'demo-1', date: d(6) },
  { id: 'd22', user_id: 'demo', type: 'expense', amount: 78_000,    description: 'Газпром нефть — заправка (Риддер + район)',       category: 'ГСМ',       accountId: 'demo-1', date: d(15) },

  // Advertising
  { id: 'd23', user_id: 'demo', type: 'expense', amount: 65_000,    description: 'Instagram таргет — УКА и ВКО',                    category: 'Реклама',   accountId: 'demo-1', date: d(8) },
  { id: 'd24', user_id: 'demo', type: 'expense', amount: 35_000,    description: '2GIS + баннер на Крыша.kz',                       category: 'Реклама',   accountId: 'demo-1', date: d(14) },

  // Telecom/IT
  { id: 'd25', user_id: 'demo', type: 'expense', amount: 28_000,    description: 'Beeline — корп. тариф 3 номера + WiFi склад',     category: 'Связь/IT',  accountId: 'demo-1', date: d(7) },
  { id: 'd26', user_id: 'demo', type: 'expense', amount: 45_000,    description: '1С:Бухгалтерия подписка + Kaspi Pay комиссия',    category: 'Связь/IT',  accountId: 'demo-1', date: d(12) },

  // Utilities
  { id: 'd27', user_id: 'demo', type: 'expense', amount: 42_000,    description: 'Коммунальные — свет, вода, отопление (склад)',    category: 'Коммуналка', accountId: 'demo-2', date: d(9) },

  // Other
  { id: 'd28', user_id: 'demo', type: 'expense', amount: 38_000,    description: 'Спецодежда — каски, перчатки, жилеты',            category: 'Прочие расходы', accountId: 'demo-3', date: d(20) },
  { id: 'd29', user_id: 'demo', type: 'expense', amount: 55_000,    description: 'Ремонт Газели — замена тормозных колодок',        category: 'Прочие расходы', accountId: 'demo-3', date: d(24) },
  { id: 'd30', user_id: 'demo', type: 'expense', amount: 15_000,    description: 'Канцтовары + печать договоров',                   category: 'Прочие расходы', accountId: 'demo-3', date: d(27) },

  // ─── Previous month expenses (for comparison) ───
  { id: 'd60', user_id: 'demo', type: 'expense', amount: 700_000,   description: 'Зарплата 3 сотрудника (февраль)',                 category: 'Зарплата',  accountId: 'demo-2', date: d(32) },
  { id: 'd61', user_id: 'demo', type: 'expense', amount: 370_000,   description: 'ОПВ + ИПН + СО (февраль)',                        category: 'Налоги',    accountId: 'demo-2', date: d(33) },
  { id: 'd62', user_id: 'demo', type: 'expense', amount: 1_100_000, description: 'ТОО «Алтай Снаб» — закуп февраль',               category: 'Закуп товаров', accountId: 'demo-1', date: d(38) },
  { id: 'd63', user_id: 'demo', type: 'expense', amount: 250_000,   description: 'Аренда февраль',                                  category: 'Аренда',    accountId: 'demo-2', date: d(34) },
  { id: 'd64', user_id: 'demo', type: 'expense', amount: 140_000,   description: 'ГСМ + логистика февраль',                         category: 'ГСМ',       accountId: 'demo-1', date: d(42) },
]
