import { useLanding } from '../context/LanguageContext'

export default function AppDemo() {
  const lt = useLanding()

  const tabs    = lt.appDemoTabs    ?? ['Транзакции', 'Аналитика', 'Календарь', 'Пользователи', 'Счета', 'Правила']
  const headers = lt.appDemoHeaders ?? ['Дата', 'Сумма', 'Счёт/баланс', 'Контрагент', 'Категория', 'Комментарий']

  const accounts = [
    { name: 'Kaspi Business',  balance: '₸ 2 845 000' },
    { name: 'Halyk Business',  balance: '₸ 1 320 000' },
    { name: lt.appDemoAccCash  ?? 'Наличные',  balance: '₸ 480 000' },
    { name: 'Kaspi Gold',      balance: '₸ 175 000' },
    { name: 'Freedom Pay',     balance: '₸ 92 000' },
    { name: lt.appDemoAccReserve ?? 'Резерв', balance: '₸ 500 000', dot: true },
  ]

  const transactions = [
    {
      date: '10 Мар', time: '14:30',
      amount: '+850 000 ₸', account: 'Kaspi Business',
      balance: '2 845 000 ₸', counterparty: 'ТОО «Астана Трейд»',
      category: lt.appDemoCatSales ?? 'Продажи', isIncome: true,
    },
    {
      date: '10 Мар', time: '12:15',
      amount: '-145 000 ₸', account: 'Halyk Business',
      balance: '1 320 000 ₸', counterparty: 'ИП Серикова А.',
      category: lt.appDemoCatSalary ?? 'Зарплата', isIncome: false,
    },
    {
      date: '09 Мар', time: '16:40',
      amount: '+420 000 ₸', account: 'Kaspi Business',
      balance: '1 995 000 ₸', counterparty: 'ИП Нурланов Б.',
      category: lt.appDemoCatServices ?? 'Услуги', isIncome: true,
    },
    {
      date: '08 Мар', time: '10:00',
      amount: '-78 000 ₸', account: 'Kaspi Business',
      balance: '1 575 000 ₸', counterparty: 'Beeline Казахстан',
      category: lt.appDemoCatComm ?? 'Связь', isIncome: false,
    },
    {
      date: '07 Мар', time: '09:20',
      amount: '-235 000 ₸', account: 'Halyk Business',
      balance: '1 465 000 ₸', counterparty: 'ТОО «Арендодатель»',
      category: lt.appDemoCatRent ?? 'Аренда', isIncome: false,
      comment: lt.appDemoCmtRent ?? 'Март 2026',
    },
    {
      date: '06 Мар', time: '17:10',
      amount: '+1 200 000 ₸', account: 'Kaspi Business',
      balance: '1 810 000 ₸', counterparty: 'ТОО «МегаСтрой»',
      category: lt.appDemoCatSales ?? 'Продажи', isIncome: true,
    },
  ]

  return (
    <section className="bg-[#24272b] grid-bg py-14 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Section title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            {lt.appDemoTitle ?? 'Как это работает'}
          </h2>
          <p className="mt-3 text-white/40 text-sm sm:text-base max-w-xl mx-auto">
            {lt.appDemoSub ?? 'Все ваши счета и транзакции — в одном месте'}
          </p>
        </div>

        {/* ── MOBILE view ── */}
        <div className="md:hidden rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#24272b]">

          {/* App top bar */}
          <div className="flex flex-col gap-3 px-4 py-3 bg-[#24272b] border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-mint flex items-center justify-center flex-shrink-0">
                <span className="text-[#24272b] font-black text-[10px]">fv</span>
              </div>
              <div>
                <p className="text-[#4F8EF7] text-sm font-bold leading-none">Finvy</p>
                <p className="text-white/40 text-[10px]">{lt.appDemoBusiness ?? 'Бизнес'} ▾</p>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button className="flex-shrink-0 bg-mint text-[#24272b] text-[11px] font-bold px-3 py-1.5 rounded-lg">
                {lt.appDemoIncome ?? '+ Доход'}
              </button>
              <button className="flex-shrink-0 bg-red-500/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">
                {lt.appDemoExpense ?? '− Расход'}
              </button>
              <button className="flex-shrink-0 bg-white/10 text-white text-[11px] font-bold px-2 py-1.5 rounded-lg">
                ⇄
              </button>
            </div>
          </div>

          {/* Tabs — scrollable */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-white/10 overflow-x-auto scrollbar-none bg-[#24272b]">
            {tabs.slice(0, 4).map((tab, i) => (
              <button
                key={tab}
                className={`flex-shrink-0 text-xs font-medium pb-0.5 ${i === 0 ? 'text-white border-b-2 border-mint' : 'text-white/40'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Balance summary */}
          <div className="px-4 py-3 bg-[#24272b] border-b border-white/10 flex flex-col gap-3">
            <div>
              <p className="text-white/40 text-[10px]">{lt.appDemoTotal ?? 'Итого на счетах'}</p>
              <p className="text-white text-lg font-bold">₸ 5 412 000</p>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {accounts.slice(0, 3).map((acc, i) => (
                <div key={i} className="min-w-[96px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center">
                  <p className="text-white/60 text-[9px] truncate max-w-[60px]">{acc.name}</p>
                  <p className="text-white/80 text-[10px] font-semibold">{acc.balance.replace('₸ ', '')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction cards */}
          <div className="divide-y divide-white/5">
            <div className="px-4 py-2 bg-[#24272b]">
              <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                {lt.appDemoFutureTx ?? 'Предстоящие транзакции • 95'} ▾
              </span>
            </div>
            {transactions.map((tx, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02]">
                {/* Color dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.isIncome ? 'bg-mint' : 'bg-red-400'}`} />

                {/* Date */}
                <div className="flex-shrink-0 w-12">
                  <p className="text-white/60 text-[11px] font-medium">{tx.date}</p>
                  <p className="text-white/30 text-[10px]">{tx.time}</p>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs font-medium truncate">{tx.counterparty}</p>
                  <p className="text-white/30 text-[10px] truncate">{tx.account} · {tx.category}</p>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <p className={`text-sm font-bold ${tx.isIncome ? 'text-mint' : 'text-red-400'}`}>
                    {tx.amount}
                  </p>
                  <p className="text-white/25 text-[10px]">{tx.balance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP view ── */}
        <div className="hidden md:block rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#2b2f34]">

          {/* App top bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#24272b] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-mint flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5C4.015 1.5 1.5 4.015 1.5 7S4.015 12.5 7 12.5 12.5 9.985 12.5 7 9.985 1.5 7 1.5z" fill="#24272b"/>
                  <path d="M7 4v6M4.5 6.5h5" stroke="#4F8EF7" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[#4F8EF7] text-sm font-bold">Finvy</p>
                <p className="text-white/40 text-xs">{lt.appDemoBusiness ?? 'Business'} ▾</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-mint text-[#24272b] text-xs font-bold px-4 py-2 rounded-lg">
                {lt.appDemoIncome ?? '+ Income'}
              </button>
              <button className="bg-red-500/80 text-white text-xs font-bold px-4 py-2 rounded-lg">
                {lt.appDemoExpense ?? '− Expense'}
              </button>
              <button className="bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg">
                {lt.appDemoTransfer ?? '⇄ Transfer'}
              </button>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-56 border-r border-white/10 p-4">
              <div className="mb-4">
                <p className="text-white/40 text-xs mb-1">{lt.appDemoTotal ?? 'Total amount on accounts'}</p>
                <p className="text-white text-xl font-bold">₸ 5 412 000</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-xs font-semibold">{lt.appDemoMyAccounts ?? 'My accounts'}</p>
              </div>
              <div className="space-y-2">
                {accounts.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {acc.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />}
                      <span className="text-white/70 text-xs">{acc.name}</span>
                    </div>
                    <span className="text-white/50 text-xs">{acc.balance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main area */}
            <div className="flex-1 p-4">
              {/* Tabs */}
              <div className="flex items-center gap-6 mb-4 border-b border-white/10 pb-3">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    className={`text-xs font-medium pb-1 ${i === 0 ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <button className="bg-[#24272b] text-white text-xs px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1">
                  {lt.appDemoAllTime ?? 'All time'} ▾
                </button>
                <div className="flex-1 max-w-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/30">
                    <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 9l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-white/30 text-xs">{lt.appDemoSearch ?? 'Search...'}</span>
                </div>
                <button className="bg-white/5 border border-white/10 text-white/50 text-xs px-3 py-1.5 rounded-lg">
                  {lt.appDemoFilter ?? 'Filter'}
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40">
                      <th className="pb-2 w-6"><input type="checkbox" className="opacity-40" /></th>
                      {headers.map(h => (
                        <th key={h} className="pb-2 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="py-2">
                        <div className="flex items-center gap-2 text-white/50 text-xs">
                          <span>{lt.appDemoFutureTx ?? 'Future transactions • 95'}</span>
                          <span>▾</span>
                        </div>
                      </td>
                    </tr>
                    {transactions.map((tx, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3"><input type="checkbox" className="opacity-40" /></td>
                        <td className="py-3">
                          <p className="text-white/80">{tx.date}</p>
                          <p className="text-white/40">{tx.time}</p>
                        </td>
                        <td className={`py-3 font-semibold ${tx.isIncome ? 'text-mint' : 'text-red-400'}`}>
                          {tx.amount}
                        </td>
                        <td className="py-3">
                          <p className="text-white/80">{tx.account}</p>
                          <p className="text-white/40">{tx.balance}</p>
                        </td>
                        <td className="py-3 text-white/70">{tx.counterparty}</td>
                        <td className="py-3 text-white/70">{tx.category}</td>
                        <td className="py-3 text-white/50">{tx.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
