# Finvy Architecture Plan

Дата: 2026-04-29

## Краткий вывод

Finvy уже собран как рабочий прототип финансового кабинета: лендинг, демо, авторизация, транзакции, счета, аналитика, календарь, отчеты, импорт выписок, кэшбек, инвойсы, налоги, зарплата, ИИ и подписки.

Главный следующий шаг: превратить набор отдельных экранов в единую финансовую систему, где все бизнес-события попадают в общий финансовый слой:

- фактические операции;
- плановые операции;
- обязательства;
- документы;
- расчеты зарплаты;
- налоги;
- инвойсы;
- прогноз cash flow;
- ИИ-инсайты.

## Что сейчас есть

### Продуктовые зоны

1. Лендинг:
   - `Hero`, `CashbackTeaser`, `Features`, `HowItWorks`, `Vs1C`, `ForBusiness`, `Pricing`, `ContactSection`, `Footer`.

2. Кабинет:
   - `TransactionsView`;
   - `AnalyticsView`;
   - `AIAnalyticsView`;
   - `CalendarView`;
   - `InvoicesView`;
   - `ReportsView`;
   - `TaxWidget`;
   - `PayrollCalculator`;
   - `UsersView`;
   - `CategoriesView`;
   - `SettingsView`.

3. Интеграции:
   - Supabase Auth;
   - Supabase tables;
   - Supabase Edge Functions для AI и Stripe;
   - Stripe checkout/portal через functions;
   - live cashback snapshot через `current_cashbacks`;
   - импорт PDF/XLSX/CSV;
   - local fallback для AI.

### Текущие таблицы, которые используются фронтом

- `accounts`;
- `transactions`;
- `fm_settings`;
- `fm_categories`;
- `fm_invoices`;
- `subscriptions`;
- `current_cashbacks`;
- `landing_leads`.

### Текущие Edge Functions

- `ai-finance-chat`;
- `create-checkout-session`;
- `create-portal-session`;
- потенциально `update-cashbacks`, судя по коду и комментариям.

## Основные пробелы

### 1. Нет единого финансового ядра

Сейчас каждый экран сам ходит в Supabase и сам считает данные. Из-за этого:

- аналитика видит только часть реальности;
- зарплата и налоги существуют отдельно;
- инвойсы не влияют на прогноз;
- импорт выписки анализирует данные, но не становится полноценным источником операций;
- ИИ получает ограниченный контекст.

Нужно ввести доменный слой: `finance core`.

### 2. Нет план-факт модели

Для бизнеса важно видеть не только прошедшие транзакции, но и будущие обязательства:

- зарплата;
- налоги;
- аренда;
- кредиты;
- регулярные платежи;
- ожидаемые поступления по инвойсам.

Сейчас это частично начато через плановый ФОТ в `localStorage`, но целевое место для этого - база.

### 3. Команда пока имитационная

`UsersView` хранит участников локально в состоянии. Для бизнес-продукта нужны:

- организации;
- участники;
- роли;
- приглашения;
- права доступа;
- RLS-политики.

### 4. Импорт выписок не завершает цикл

Импорт умеет распарсить и проанализировать, но нужен сценарий:

1. загрузка выписки;
2. предпросмотр;
3. распознавание дублей;
4. массовая правка категорий;
5. сохранение в `transactions`;
6. создание `import_batches`.

### 5. Кэшбек оторван от карт пользователя

Сейчас кэшбек анализирует траты и банки, но у пользователя нет сущности "мои карты":

- какие карты уже есть;
- какие лимиты;
- какую карту использовать для категории;
- где выгода уже получена;
- когда условия банка устарели.

### 6. ИИ должен стать финансовым ассистентом поверх всей модели

Сейчас ИИ смотрит в основном на транзакции и счета. Ему нужно давать:

- зарплату;
- налоги;
- инвойсы;
- плановые операции;
- просрочки;
- прогноз cash flow;
- кэшбек-рекомендации;
- настройки бизнеса.

### 7. Кодировка и локализация требуют чистки

В части файлов есть поврежденные русские/казахские строки. Это мешает поддержке, поиску и качеству UI.

Нужно:

- привести файлы к UTF-8;
- вынести локализацию в отдельные словари;
- убрать дубли текстов из компонентов;
- добавить недостающие ключи.

## Целевая архитектура

### Слои приложения

```text
UI pages/components
  ↓
feature modules
  ↓
domain services
  ↓
repositories
  ↓
Supabase / Edge Functions / local demo adapter
```

### Предлагаемая структура `src`

```text
src/
  app/
    routes.jsx
    providers.jsx
  shared/
    ui/
    lib/
    format/
    constants/
  entities/
    account/
    transaction/
    category/
    invoice/
    payroll/
    tax/
    planned-operation/
    organization/
    cashback/
  features/
    dashboard-shell/
    transaction-entry/
    statement-import/
    cashflow-forecast/
    payroll-planning/
    tax-planning/
    invoice-management/
    cashback-analysis/
    ai-assistant/
  pages/
    landing/
    dashboard/
  data/
    demo/
```

### Domain services

Нужно постепенно вынести бизнес-логику из компонентов:

- `financeService`
  - собрать фактические операции;
  - собрать плановые операции;
  - посчитать cash flow;
  - посчитать P&L;
  - собрать категории.

- `payrollService`
  - расчет net/gross;
  - расчет ФОТ;
  - создание payroll run;
  - создание planned operations.

- `taxService`
  - расчет налогов;
  - сроки;
  - налоговые обязательства;
  - создание planned operations.

- `invoiceService`
  - статусы;
  - ожидаемые поступления;
  - overdue risk;
  - влияние на cash flow.

- `importService`
  - parse;
  - normalize;
  - deduplicate;
  - categorize;
  - save batch.

- `cashbackService`
  - сопоставление категорий;
  - подбор карты;
  - расчет выгоды;
  - учет карт пользователя.

- `aiContextService`
  - собрать короткий финансовый контекст;
  - собрать полный контекст;
  - локальные fallback-инсайты.

## Целевая модель данных

### Организации и доступ

`organizations`

- id;
- owner_user_id;
- name;
- country;
- default_currency;
- profile_type;
- tax_regime;
- created_at;
- updated_at.

`organization_members`

- id;
- organization_id;
- user_id;
- email;
- role: owner/admin/accountant/member/viewer;
- status: active/invited/removed;
- created_at.

`organization_invites`

- id;
- organization_id;
- email;
- role;
- token_hash;
- expires_at;
- accepted_at;
- created_at.

### Финансовое ядро

`accounts`

- добавить `organization_id`;
- сохранить `user_id` временно для совместимости;
- name;
- type;
- currency;
- opening_balance;
- current_balance;
- bank_name;
- card_last4;
- is_active.

`transactions`

- добавить `organization_id`;
- account_id;
- type: income/expense/transfer;
- amount;
- currency;
- date;
- category_id;
- counterparty_id;
- description;
- comment;
- source: manual/import/invoice/payroll/tax/system;
- source_id;
- import_batch_id;
- transfer_group_id;
- created_by.

`planned_operations`

- id;
- organization_id;
- type;
- category_id;
- amount;
- currency;
- planned_date;
- repeat_rule;
- status: planned/posted/skipped/canceled;
- source: payroll/tax/invoice/manual/subscription;
- source_id;
- description;
- created_at.

`cashflow_snapshots`

- id;
- organization_id;
- period_start;
- period_end;
- actual_income;
- actual_expense;
- planned_income;
- planned_expense;
- projected_balance;
- risk_level;
- generated_at.

### Зарплата

`payroll_employees`

- id;
- organization_id;
- name;
- role;
- employment_type;
- gross_salary;
- currency;
- start_date;
- is_active;
- created_at;
- updated_at.

`payroll_runs`

- id;
- organization_id;
- period;
- status: draft/planned/posted/paid;
- employee_count;
- gross_total;
- net_total;
- employee_deductions_total;
- employer_contributions_total;
- company_cost_total;
- planned_operation_id;
- created_at.

`payroll_run_items`

- id;
- payroll_run_id;
- employee_id;
- gross;
- opv;
- vosms;
- ipn_base;
- ipn;
- net;
- so;
- osms;
- oppv;
- employer_total;
- company_cost.

### Налоги

`tax_obligations`

- id;
- organization_id;
- regime;
- period_start;
- period_end;
- form_code;
- due_date;
- tax_base;
- amount;
- status: draft/planned/paid/overdue;
- planned_operation_id;
- created_at.

### Инвойсы

`fm_invoices`

- добавить `organization_id`;
- добавить `counterparty_id`;
- добавить `planned_operation_id`;
- добавить `paid_transaction_id`;

`counterparties`

- id;
- organization_id;
- name;
- type: client/vendor/employee/bank/state/other;
- email;
- phone;
- bin_iin;
- notes.

### Импорт

`import_batches`

- id;
- organization_id;
- account_id;
- file_name;
- file_type;
- source_bank;
- status: parsed/confirmed/failed;
- rows_total;
- rows_imported;
- rows_skipped;
- created_at.

`import_rows`

- id;
- import_batch_id;
- raw_data;
- normalized_data;
- duplicate_of_transaction_id;
- status: pending/imported/skipped/error.

### Кэшбек

`user_cards`

- id;
- organization_id;
- bank_id;
- card_name;
- account_id;
- active;
- monthly_limit_override;
- notes.

`cashback_recommendations`

- id;
- organization_id;
- period_start;
- period_end;
- data;
- generated_at.

## Какие функции добавить

### P0: финансовый центр

1. Единый cash flow forecast:
   - текущий баланс;
   - факт;
   - план;
   - зарплата;
   - налоги;
   - ожидаемые инвойсы;
   - риск кассового разрыва.

2. Плановые операции:
   - ручные;
   - из зарплаты;
   - из налогов;
   - из инвойсов;
   - регулярные платежи.

3. Импорт выписок в транзакции:
   - подтверждение перед сохранением;
   - дедупликация;
   - массовая категоризация;
   - сохранение batch history.

4. Payroll v2:
   - сохранение сотрудников в Supabase;
   - payroll run;
   - планирование выплаты;
   - создание фактических транзакций после выплаты.

5. AI v2:
   - AI видит факт + план + инвойсы + налоги + зарплату;
   - быстрые сценарии: "хватит ли денег", "что угрожает cash flow", "можно ли нанять".

### P1: бизнес-операции

1. Контрагенты:
   - клиенты;
   - поставщики;
   - сотрудники;
   - связь с транзакциями и инвойсами.

2. Команды и роли:
   - организация;
   - приглашения;
   - роли;
   - RLS.

3. Бюджеты:
   - лимит по категории;
   - факт/план;
   - предупреждения;
   - рекомендации ИИ.

4. Налоговый календарь:
   - налоговые обязательства;
   - сроки;
   - резервирование денег;
   - статус оплаты.

### P2: усиление ценности

1. Мои карты и кэшбек:
   - сохраненные карты пользователя;
   - рекомендации по категориям;
   - оценка выгоды;
   - напоминания об изменении условий.

2. Документы:
   - прикрепление файлов к операциям;
   - инвойсы, акты, договоры;
   - экспорт отчетов.

3. Автоматические правила:
   - если описание содержит X, категория Y;
   - если контрагент X, счет Y;
   - если сумма повторяется, сделать регулярной.

4. Multi-currency:
   - курсы валют;
   - пересчет в базовую валюту;
   - валютная прибыль/убыток.

## Технические задачи

### Обязательные

- Вынести Supabase-запросы из UI-компонентов в repositories.
- Ввести `organization_id` как главный tenant key.
- Настроить RLS-политики под организации и роли.
- Убрать хранение бизнес-данных из `localStorage`, оставить только UI preferences.
- Почистить кодировку русских/казахских текстов.
- Стабилизировать демо-режим через отдельный demo adapter.
- Добавить error boundary для кабинета.
- Добавить loading/error states в каждый data-зависимый экран.

### Желательные

- Добавить TypeScript или хотя бы JSDoc-типы для доменных сущностей.
- Добавить тесты на расчеты:
  - payroll;
  - tax;
  - cash flow;
  - import parser;
  - cashback recommendations.
- Добавить code splitting для тяжелых модулей:
  - PDF parser;
  - XLSX;
  - jsPDF;
  - recharts.

## Предлагаемый roadmap

### Sprint 1: Architecture Cleanup

- Создать `src/entities` и `src/features`.
- Вынести repositories:
  - accounts;
  - transactions;
  - settings;
  - invoices;
  - categories.
- Вынести форматирование денег/дат в `shared/format`.
- Исправить кодировку ключевых файлов.

### Sprint 2: Plan-Fact Foundation

- Добавить таблицу `planned_operations`.
- Перенести плановый ФОТ из `localStorage` в Supabase.
- Подключить planned operations к Analytics и Calendar.
- Добавить фильтр "Факт / План / Все".

### Sprint 3: Payroll Persistence

- Добавить `payroll_employees`, `payroll_runs`, `payroll_run_items`.
- Сохранять сотрудников.
- Создавать payroll run.
- Создавать planned operation из payroll run.
- Добавить payroll report.

### Sprint 4: Import to Transactions

- Добавить `import_batches` и `import_rows`.
- Сделать preview импорта.
- Добавить дедупликацию.
- Сохранять подтвержденные строки в `transactions`.

### Sprint 5: Forecast and AI

- Сделать `cashflowService`.
- Добавить экран/блок прогноза.
- Передавать в AI полный финансовый контекст.
- Добавить быстрые AI-команды для бизнес-решений.

### Sprint 6: Teams and Roles

- Добавить `organizations`, `organization_members`, `organization_invites`.
- Перевести все ключевые таблицы на `organization_id`.
- Включить RLS-политики.
- Сделать настоящие приглашения.

## Архитектурный принцип

Finvy должен отвечать не только "что было?", но и "что будет с деньгами?".

Поэтому центральная модель продукта:

```text
Факт: transactions
План: planned_operations
Обязательства: payroll + tax + invoices + recurring
Прогноз: cashflow snapshots
Решения: AI insights + recommendations
```

Если строить следующие функции вокруг этой модели, сервис станет цельным и гораздо сильнее обычной таблицы расходов.
