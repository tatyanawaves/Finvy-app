create extension if not exists "pg_cron" with schema "pg_catalog";

drop policy "Users can manage their own employees" on "public"."fm_employees";

drop policy "Users can manage their own payroll plan" on "public"."fm_planned_payroll";

drop policy "Users can manage their own auth tokens" on "public"."telegram_auth_tokens";

drop policy "Users can see their own telegram link" on "public"."telegram_users";

revoke references on table "public"."fm_employees" from "anon";

revoke trigger on table "public"."fm_employees" from "anon";

revoke truncate on table "public"."fm_employees" from "anon";

revoke references on table "public"."fm_employees" from "authenticated";

revoke trigger on table "public"."fm_employees" from "authenticated";

revoke truncate on table "public"."fm_employees" from "authenticated";

revoke references on table "public"."fm_employees" from "service_role";

revoke trigger on table "public"."fm_employees" from "service_role";

revoke truncate on table "public"."fm_employees" from "service_role";

revoke references on table "public"."fm_planned_payroll" from "anon";

revoke trigger on table "public"."fm_planned_payroll" from "anon";

revoke truncate on table "public"."fm_planned_payroll" from "anon";

revoke references on table "public"."fm_planned_payroll" from "authenticated";

revoke trigger on table "public"."fm_planned_payroll" from "authenticated";

revoke truncate on table "public"."fm_planned_payroll" from "authenticated";

revoke references on table "public"."fm_planned_payroll" from "service_role";

revoke trigger on table "public"."fm_planned_payroll" from "service_role";

revoke truncate on table "public"."fm_planned_payroll" from "service_role";

alter table "public"."fm_employees" drop constraint "fm_employees_user_id_fkey";

alter table "public"."fm_planned_payroll" drop constraint "fm_planned_payroll_user_id_fkey";

alter table "public"."telegram_users" drop constraint "telegram_users_user_id_fkey";

alter table "public"."fm_employees" drop constraint "fm_employees_pkey";

alter table "public"."fm_planned_payroll" drop constraint "fm_planned_payroll_pkey";

alter table "public"."telegram_users" drop constraint "telegram_users_pkey";

drop index if exists "public"."fm_employees_pkey";

drop index if exists "public"."fm_planned_payroll_pkey";

drop index if exists "public"."telegram_auth_tokens_pkey";

drop index if exists "public"."telegram_users_pkey";

drop table "public"."fm_employees";

drop table "public"."fm_planned_payroll";


  create table "public"."accounts" (
    "id" text not null default (gen_random_uuid())::text,
    "name" text not null,
    "type" text not null,
    "balance" real not null default 0,
    "currency" text not null default 'KZT'::text,
    "user_id" uuid
      );


alter table "public"."accounts" enable row level security;


  create table "public"."app_settings" (
    "key" text not null,
    "value" text not null,
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."bank_cashbacks_snapshots" (
    "id" uuid not null default gen_random_uuid(),
    "version" integer not null,
    "data" jsonb not null,
    "source" text not null default 'ai'::text,
    "model" text,
    "banks_count" integer,
    "cards_count" integer,
    "created_at" timestamp with time zone default now(),
    "is_active" boolean default true
      );


alter table "public"."bank_cashbacks_snapshots" enable row level security;


  create table "public"."budgets" (
    "id" text not null default (gen_random_uuid())::text,
    "category" text not null,
    "limit" real not null,
    "period" text default 'monthly'::text,
    "priority" text default 'medium'::text,
    "payment_day" integer
      );



  create table "public"."card_transfers" (
    "id" uuid not null default gen_random_uuid(),
    "from_card_id" uuid,
    "to_card_id" uuid,
    "amount" numeric(15,2) not null,
    "currency" text not null default 'KZT'::text,
    "description" text,
    "status" text not null default 'completed'::text,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."cashback_programs" (
    "id" text not null default (gen_random_uuid())::text,
    "bank" text not null,
    "program" text not null,
    "type" text not null,
    "base_cashback" real not null default 0,
    "max_cashback" real not null default 0,
    "conditions" jsonb default '[]'::jsonb,
    "max_monthly_cashback" real,
    "applies_to" text default 'all_purchases'::text,
    "currency" text not null,
    "card_fee" real default 0,
    "notes" text,
    "last_updated" date default CURRENT_DATE,
    "data_source" text
      );



  create table "public"."cashback_update_log" (
    "id" uuid not null default gen_random_uuid(),
    "status" text not null,
    "snapshot_id" uuid,
    "banks_changed" integer default 0,
    "cards_changed" integer default 0,
    "rates_changed" integer default 0,
    "diff" jsonb,
    "error_message" text,
    "duration_ms" integer,
    "triggered_by" text default 'cron'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."cashback_update_log" enable row level security;


  create table "public"."debts" (
    "id" text not null default (gen_random_uuid())::text,
    "person" text not null,
    "amount" real not null,
    "type" text not null,
    "dueDate" timestamp with time zone,
    "description" text
      );



  create table "public"."fm_categories" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "type" text not null default 'expense'::text,
    "color" text not null default '#3DD9B3'::text,
    "icon" text not null default '📁'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."fm_categories" enable row level security;


  create table "public"."fm_invoices" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "number" text not null,
    "client_name" text not null,
    "client_email" text,
    "amount" numeric(12,2) not null default 0,
    "currency" text not null default 'USD'::text,
    "status" text not null default 'pending'::text,
    "issue_date" date not null default CURRENT_DATE,
    "due_date" date,
    "description" text,
    "items" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."fm_invoices" enable row level security;


  create table "public"."fm_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "display_name" text,
    "default_currency" text not null default 'USD'::text,
    "timezone" text not null default 'UTC'::text,
    "language" text not null default 'en'::text,
    "date_format" text not null default 'MM/DD/YYYY'::text,
    "updated_at" timestamp with time zone default now(),
    "onboarding_done" boolean default false,
    "survey_data" jsonb,
    "tax_regime" text default 'simplified_ip'::text
      );


alter table "public"."fm_settings" enable row level security;


  create table "public"."goals" (
    "id" text not null default (gen_random_uuid())::text,
    "name" text not null,
    "targetAmount" real not null,
    "currentAmount" real not null default 0,
    "deadline" timestamp with time zone,
    "currency" text default 'KZT'::text
      );



  create table "public"."monthly_budgets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "month" character(7) not null,
    "category" text not null,
    "planned_amount" numeric(14,2) not null default 0,
    "rollover_in" numeric(14,2) not null default 0,
    "rollover_enabled" boolean not null default true,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."monthly_budgets" enable row level security;


  create table "public"."monthly_reports" (
    "id" text not null default (gen_random_uuid())::text,
    "period" text not null,
    "content" text not null,
    "generated_at" timestamp with time zone default now(),
    "read_at" timestamp with time zone
      );



  create table "public"."notification_analytics" (
    "id" text not null default (gen_random_uuid())::text,
    "notification_id" text,
    "type" text not null,
    "channel" text not null,
    "sent_at" timestamp with time zone,
    "opened_at" timestamp with time zone,
    "action_taken" text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."notification_preferences" (
    "id" text not null default (gen_random_uuid())::text,
    "telegram_chat_id" text,
    "morning_brief" boolean default true,
    "morning_time" time without time zone default '08:00:00'::time without time zone,
    "evening_summary" boolean default true,
    "evening_time" time without time zone default '21:00:00'::time without time zone,
    "weekly_report" boolean default true,
    "weekly_day" integer default 0,
    "monthly_report" boolean default true,
    "transaction_alerts" boolean default true,
    "cashback_tips" boolean default true,
    "credit_reminders" boolean default true,
    "streak_alerts" boolean default true,
    "quiet_hours_start" time without time zone default '23:00:00'::time without time zone,
    "quiet_hours_end" time without time zone default '07:00:00'::time without time zone,
    "channels" text[] default ARRAY['telegram'::text, 'push'::text],
    "timezone" text default 'Asia/Almaty'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."notifications_queue" (
    "id" text not null default (gen_random_uuid())::text,
    "type" text not null,
    "priority" integer default 3,
    "channels" text[] not null default ARRAY['telegram'::text, 'push'::text],
    "payload" jsonb not null default '{}'::jsonb,
    "scheduled_at" timestamp with time zone default now(),
    "sent_at" timestamp with time zone,
    "opened_at" timestamp with time zone,
    "status" text default 'pending'::text
      );



  create table "public"."pending_topups" (
    "id" uuid not null default gen_random_uuid(),
    "card_id" uuid,
    "topup_code" text not null,
    "amount" numeric(15,2),
    "status" text not null default 'pending'::text,
    "note" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."savings_goals" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "target_amount" numeric(14,2) not null,
    "saved_amount" numeric(14,2) not null default 0,
    "target_date" date,
    "category" text,
    "account_id" uuid,
    "icon" text,
    "color" text,
    "notes" text,
    "is_archived" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."savings_goals" enable row level security;


  create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "plan_id" text not null default 'starter'::text,
    "billing_period" text not null default 'monthly'::text,
    "status" text not null default 'trialing'::text,
    "trial_end" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."subscriptions" enable row level security;


  create table "public"."transactions" (
    "id" text not null default (gen_random_uuid())::text,
    "accountId" text,
    "amount" real not null,
    "type" text not null,
    "category" text not null,
    "date" timestamp with time zone default now(),
    "description" text,
    "isAutoCategorized" boolean default false,
    "user_id" uuid,
    "counterparty" text,
    "comment" text,
    "project" text
      );


alter table "public"."transactions" enable row level security;


  create table "public"."user_profiles" (
    "id" text not null default (gen_random_uuid())::text,
    "monthly_income" real not null default 0,
    "city" text,
    "current_banks" text[] default '{}'::text[],
    "current_cards" text[] default '{}'::text[],
    "avg_card_balance" real default 0,
    "has_deposits" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."virtual_cards" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "card_number" text not null,
    "card_holder_name" text not null,
    "balance" numeric(15,2) not null default 0,
    "currency" text not null default 'KZT'::text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone not null default (now() + '3 years'::interval)
      );


alter table "public"."telegram_auth_tokens" add column "expires_at" timestamp with time zone default (now() + '00:05:00'::interval);

alter table "public"."telegram_auth_tokens" alter column "token" drop default;

alter table "public"."telegram_auth_tokens" alter column "token" set data type text using "token"::text;

alter table "public"."telegram_users" drop column "user_id";

alter table "public"."telegram_users" add column "id" uuid not null default gen_random_uuid();

alter table "public"."telegram_users" disable row level security;

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX app_settings_pkey ON public.app_settings USING btree (key);

CREATE UNIQUE INDEX bank_cashbacks_snapshots_pkey ON public.bank_cashbacks_snapshots USING btree (id);

CREATE UNIQUE INDEX budgets_category_unique ON public.budgets USING btree (category);

CREATE UNIQUE INDEX budgets_pkey ON public.budgets USING btree (id);

CREATE UNIQUE INDEX card_transfers_pkey ON public.card_transfers USING btree (id);

CREATE UNIQUE INDEX cashback_programs_pkey ON public.cashback_programs USING btree (id);

CREATE UNIQUE INDEX cashback_update_log_pkey ON public.cashback_update_log USING btree (id);

CREATE UNIQUE INDEX debts_pkey ON public.debts USING btree (id);

CREATE UNIQUE INDEX fm_categories_pkey ON public.fm_categories USING btree (id);

CREATE UNIQUE INDEX fm_invoices_pkey ON public.fm_invoices USING btree (id);

CREATE UNIQUE INDEX fm_settings_pkey ON public.fm_settings USING btree (id);

CREATE UNIQUE INDEX fm_settings_user_id_key ON public.fm_settings USING btree (user_id);

CREATE UNIQUE INDEX goals_pkey ON public.goals USING btree (id);

CREATE INDEX idx_card_transfers_from ON public.card_transfers USING btree (from_card_id);

CREATE INDEX idx_card_transfers_to ON public.card_transfers USING btree (to_card_id);

CREATE INDEX idx_cashback_update_log_created ON public.cashback_update_log USING btree (created_at DESC);

CREATE INDEX idx_cashbacks_snapshots_active ON public.bank_cashbacks_snapshots USING btree (is_active, created_at DESC) WHERE (is_active = true);

CREATE INDEX idx_cashbacks_snapshots_version ON public.bank_cashbacks_snapshots USING btree (version DESC);

CREATE INDEX idx_mb_user_category ON public.monthly_budgets USING btree (user_id, category);

CREATE INDEX idx_mb_user_month ON public.monthly_budgets USING btree (user_id, month);

CREATE INDEX idx_notifications_queue_scheduled ON public.notifications_queue USING btree (scheduled_at);

CREATE INDEX idx_notifications_queue_status ON public.notifications_queue USING btree (status);

CREATE INDEX idx_pending_topups_card_id ON public.pending_topups USING btree (card_id);

CREATE INDEX idx_pending_topups_status ON public.pending_topups USING btree (status);

CREATE INDEX idx_savings_user ON public.savings_goals USING btree (user_id, is_archived);

CREATE INDEX idx_subscriptions_stripe_cust_id ON public.subscriptions USING btree (stripe_customer_id);

CREATE INDEX idx_subscriptions_stripe_sub_id ON public.subscriptions USING btree (stripe_subscription_id);

CREATE INDEX idx_virtual_cards_card_number ON public.virtual_cards USING btree (card_number);

CREATE INDEX idx_virtual_cards_user_id ON public.virtual_cards USING btree (user_id);

CREATE UNIQUE INDEX mb_unique_per_month ON public.monthly_budgets USING btree (user_id, month, category);

CREATE UNIQUE INDEX monthly_budgets_pkey ON public.monthly_budgets USING btree (id);

CREATE UNIQUE INDEX monthly_reports_period_key ON public.monthly_reports USING btree (period);

CREATE UNIQUE INDEX monthly_reports_pkey ON public.monthly_reports USING btree (id);

CREATE UNIQUE INDEX notification_analytics_pkey ON public.notification_analytics USING btree (id);

CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id);

CREATE UNIQUE INDEX notifications_queue_pkey ON public.notifications_queue USING btree (id);

CREATE UNIQUE INDEX pending_topups_pkey ON public.pending_topups USING btree (id);

CREATE UNIQUE INDEX savings_goals_pkey ON public.savings_goals USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX subscriptions_user_id_key ON public.subscriptions USING btree (user_id);

CREATE UNIQUE INDEX telegram_users_chat_id_key ON public.telegram_users USING btree (chat_id);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX virtual_cards_card_number_key ON public.virtual_cards USING btree (card_number);

CREATE UNIQUE INDEX virtual_cards_pkey ON public.virtual_cards USING btree (id);

CREATE UNIQUE INDEX telegram_auth_tokens_pkey ON public.telegram_auth_tokens USING btree (token);

CREATE UNIQUE INDEX telegram_users_pkey ON public.telegram_users USING btree (id);

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";

alter table "public"."bank_cashbacks_snapshots" add constraint "bank_cashbacks_snapshots_pkey" PRIMARY KEY using index "bank_cashbacks_snapshots_pkey";

alter table "public"."budgets" add constraint "budgets_pkey" PRIMARY KEY using index "budgets_pkey";

alter table "public"."card_transfers" add constraint "card_transfers_pkey" PRIMARY KEY using index "card_transfers_pkey";

alter table "public"."cashback_programs" add constraint "cashback_programs_pkey" PRIMARY KEY using index "cashback_programs_pkey";

alter table "public"."cashback_update_log" add constraint "cashback_update_log_pkey" PRIMARY KEY using index "cashback_update_log_pkey";

alter table "public"."debts" add constraint "debts_pkey" PRIMARY KEY using index "debts_pkey";

alter table "public"."fm_categories" add constraint "fm_categories_pkey" PRIMARY KEY using index "fm_categories_pkey";

alter table "public"."fm_invoices" add constraint "fm_invoices_pkey" PRIMARY KEY using index "fm_invoices_pkey";

alter table "public"."fm_settings" add constraint "fm_settings_pkey" PRIMARY KEY using index "fm_settings_pkey";

alter table "public"."goals" add constraint "goals_pkey" PRIMARY KEY using index "goals_pkey";

alter table "public"."monthly_budgets" add constraint "monthly_budgets_pkey" PRIMARY KEY using index "monthly_budgets_pkey";

alter table "public"."monthly_reports" add constraint "monthly_reports_pkey" PRIMARY KEY using index "monthly_reports_pkey";

alter table "public"."notification_analytics" add constraint "notification_analytics_pkey" PRIMARY KEY using index "notification_analytics_pkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_pkey" PRIMARY KEY using index "notification_preferences_pkey";

alter table "public"."notifications_queue" add constraint "notifications_queue_pkey" PRIMARY KEY using index "notifications_queue_pkey";

alter table "public"."pending_topups" add constraint "pending_topups_pkey" PRIMARY KEY using index "pending_topups_pkey";

alter table "public"."savings_goals" add constraint "savings_goals_pkey" PRIMARY KEY using index "savings_goals_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."virtual_cards" add constraint "virtual_cards_pkey" PRIMARY KEY using index "virtual_cards_pkey";

alter table "public"."telegram_users" add constraint "telegram_users_pkey" PRIMARY KEY using index "telegram_users_pkey";

alter table "public"."accounts" add constraint "accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."accounts" validate constraint "accounts_user_id_fkey";

alter table "public"."budgets" add constraint "budgets_category_unique" UNIQUE using index "budgets_category_unique";

alter table "public"."budgets" add constraint "budgets_payment_day_check" CHECK (((payment_day >= 1) AND (payment_day <= 28))) not valid;

alter table "public"."budgets" validate constraint "budgets_payment_day_check";

alter table "public"."card_transfers" add constraint "card_transfers_from_card_id_fkey" FOREIGN KEY (from_card_id) REFERENCES public.virtual_cards(id) ON DELETE SET NULL not valid;

alter table "public"."card_transfers" validate constraint "card_transfers_from_card_id_fkey";

alter table "public"."card_transfers" add constraint "card_transfers_to_card_id_fkey" FOREIGN KEY (to_card_id) REFERENCES public.virtual_cards(id) ON DELETE SET NULL not valid;

alter table "public"."card_transfers" validate constraint "card_transfers_to_card_id_fkey";

alter table "public"."cashback_update_log" add constraint "cashback_update_log_snapshot_id_fkey" FOREIGN KEY (snapshot_id) REFERENCES public.bank_cashbacks_snapshots(id) ON DELETE SET NULL not valid;

alter table "public"."cashback_update_log" validate constraint "cashback_update_log_snapshot_id_fkey";

alter table "public"."fm_categories" add constraint "fm_categories_type_check" CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text, 'both'::text]))) not valid;

alter table "public"."fm_categories" validate constraint "fm_categories_type_check";

alter table "public"."fm_categories" add constraint "fm_categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."fm_categories" validate constraint "fm_categories_user_id_fkey";

alter table "public"."fm_invoices" add constraint "fm_invoices_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text, 'draft'::text]))) not valid;

alter table "public"."fm_invoices" validate constraint "fm_invoices_status_check";

alter table "public"."fm_invoices" add constraint "fm_invoices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."fm_invoices" validate constraint "fm_invoices_user_id_fkey";

alter table "public"."fm_settings" add constraint "fm_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."fm_settings" validate constraint "fm_settings_user_id_fkey";

alter table "public"."fm_settings" add constraint "fm_settings_user_id_key" UNIQUE using index "fm_settings_user_id_key";

alter table "public"."monthly_budgets" add constraint "mb_month_format" CHECK ((month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'::text)) not valid;

alter table "public"."monthly_budgets" validate constraint "mb_month_format";

alter table "public"."monthly_budgets" add constraint "mb_planned_nonneg" CHECK ((planned_amount >= (0)::numeric)) not valid;

alter table "public"."monthly_budgets" validate constraint "mb_planned_nonneg";

alter table "public"."monthly_budgets" add constraint "mb_unique_per_month" UNIQUE using index "mb_unique_per_month";

alter table "public"."monthly_budgets" add constraint "monthly_budgets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."monthly_budgets" validate constraint "monthly_budgets_user_id_fkey";

alter table "public"."monthly_reports" add constraint "monthly_reports_period_key" UNIQUE using index "monthly_reports_period_key";

alter table "public"."notification_analytics" add constraint "notification_analytics_notification_id_fkey" FOREIGN KEY (notification_id) REFERENCES public.notifications_queue(id) ON DELETE SET NULL not valid;

alter table "public"."notification_analytics" validate constraint "notification_analytics_notification_id_fkey";

alter table "public"."pending_topups" add constraint "pending_topups_card_id_fkey" FOREIGN KEY (card_id) REFERENCES public.virtual_cards(id) ON DELETE CASCADE not valid;

alter table "public"."pending_topups" validate constraint "pending_topups_card_id_fkey";

alter table "public"."savings_goals" add constraint "savings_goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."savings_goals" validate constraint "savings_goals_user_id_fkey";

alter table "public"."savings_goals" add constraint "savings_saved_nonneg" CHECK ((saved_amount >= (0)::numeric)) not valid;

alter table "public"."savings_goals" validate constraint "savings_saved_nonneg";

alter table "public"."savings_goals" add constraint "savings_target_pos" CHECK ((target_amount > (0)::numeric)) not valid;

alter table "public"."savings_goals" validate constraint "savings_target_pos";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_key" UNIQUE using index "subscriptions_user_id_key";

alter table "public"."telegram_users" add constraint "telegram_users_chat_id_key" UNIQUE using index "telegram_users_chat_id_key";

alter table "public"."transactions" add constraint "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.accounts(id) not valid;

alter table "public"."transactions" validate constraint "transactions_accountId_fkey";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."virtual_cards" add constraint "virtual_cards_card_number_key" UNIQUE using index "virtual_cards_card_number_key";

alter table "public"."virtual_cards" add constraint "virtual_cards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."virtual_cards" validate constraint "virtual_cards_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."current_cashbacks" as  SELECT id,
    version,
    data,
    model,
    banks_count,
    cards_count,
    created_at
   FROM public.bank_cashbacks_snapshots
  WHERE (is_active = true)
  ORDER BY created_at DESC
 LIMIT 1;


CREATE OR REPLACE FUNCTION public.deactivate_previous_snapshots()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.is_active THEN
    UPDATE public.bank_cashbacks_snapshots
       SET is_active = false
     WHERE id <> NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Default accounts
  INSERT INTO public.accounts (name, type, balance, currency, user_id) VALUES
    ('Bank card', 'bank', 12000, 'USD', NEW.id),
    ('Cash', 'cash', 1500, 'USD', NEW.id),
    ('Wise', 'bank', 3200, 'EUR', NEW.id);

  -- Default categories income
  INSERT INTO public.fm_categories (name, type, color, user_id) VALUES
    ('Sales', 'income', '#3DD9B3', NEW.id),
    ('Services', 'income', '#22d3ee', NEW.id),
    ('Investments', 'income', '#a78bfa', NEW.id),
    ('Other income', 'income', '#86efac', NEW.id);

  -- Default categories expense
  INSERT INTO public.fm_categories (name, type, color, user_id) VALUES
    ('Salary', 'expense', '#f87171', NEW.id),
    ('Office', 'expense', '#fb923c', NEW.id),
    ('Marketing', 'expense', '#fbbf24', NEW.id),
    ('Software', 'expense', '#a78bfa', NEW.id),
    ('Taxes', 'expense', '#f472b6', NEW.id),
    ('Other expenses', 'expense', '#94a3b8', NEW.id);

  -- Sample transactions (last 30 days)
  INSERT INTO public.transactions (amount, type, category, description, counterparty, date, user_id, "accountId")
  SELECT
    t.amount, t.type, t.category, t.description, t.counterparty,
    now() - (random() * interval '30 days'),
    NEW.id,
    (SELECT id FROM public.accounts WHERE user_id = NEW.id LIMIT 1)
  FROM (VALUES
    (5000, 'income', 'Sales', 'Invoice #1042', 'Acme Corp'),
    (1200, 'income', 'Services', 'Consulting April', 'TechStart LLC'),
    (-850, 'expense', 'Salary', 'Team member March', 'John D.'),
    (-320, 'expense', 'Software', 'Figma + Notion subs', NULL),
    (3400, 'income', 'Sales', 'Invoice #1043', 'GlobalShop'),
    (-1200, 'expense', 'Marketing', 'Meta Ads March', NULL),
    (-450, 'expense', 'Office', 'Coworking April', NULL),
    (900, 'income', 'Services', 'Design sprint', 'StartupX'),
    (-280, 'expense', 'Taxes', 'VAT Q1', NULL),
    (2100, 'income', 'Sales', 'Invoice #1044', 'Buildco'),
    (-600, 'expense', 'Salary', 'Freelancer payment', 'Maria K.'),
    (750, 'income', 'Other income', 'Affiliate commission', NULL),
    (-180, 'expense', 'Software', 'AWS March', NULL),
    (4200, 'income', 'Sales', 'Invoice #1045', 'Retail Plus'),
    (-950, 'expense', 'Marketing', 'Google Ads', NULL)
  ) AS t(amount, type, category, description, counterparty);

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.monthly_budgets_rollover(p_user_id uuid, p_from_month character, p_to_month character)
 RETURNS TABLE(category text, leftover numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_from_start TIMESTAMPTZ;
  v_from_end TIMESTAMPTZ;
BEGIN
  -- Build [from, to) range for the source month
  v_from_start := (p_from_month || '-01')::DATE;
  v_from_end := (v_from_start + INTERVAL '1 month');

  RETURN QUERY
  WITH src AS (
    SELECT
      b.category,
      b.planned_amount + COALESCE(b.rollover_in, 0) AS cap,
      COALESCE((
        SELECT SUM(ABS(t.amount))
        FROM public.transactions t
        WHERE t.user_id = p_user_id
          AND t.type = 'expense'
          AND t.category = b.category
          AND t.date >= v_from_start
          AND t.date < v_from_end
      ), 0) AS spent,
      b.rollover_enabled
    FROM public.monthly_budgets b
    WHERE b.user_id = p_user_id
      AND b.month = p_from_month
  ),
  carry AS (
    SELECT category, (cap - spent)::NUMERIC AS leftover
    FROM src
    WHERE rollover_enabled = true
  ),
  upserted AS (
    INSERT INTO public.monthly_budgets (user_id, month, category, planned_amount, rollover_in)
    SELECT p_user_id, p_to_month, c.category, 0, c.leftover
    FROM carry c
    ON CONFLICT (user_id, month, category)
    DO UPDATE SET rollover_in = EXCLUDED.rollover_in
    RETURNING monthly_budgets.category
  )
  SELECT c.category, c.leftover FROM carry c;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.monthly_budgets_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.next_cashback_version()
 RETURNS integer
 LANGUAGE sql
AS $function$
  SELECT COALESCE(MAX(version), 0) + 1 FROM public.bank_cashbacks_snapshots;
$function$
;

CREATE OR REPLACE FUNCTION public.savings_goals_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."accounts" to "anon";

grant insert on table "public"."accounts" to "anon";

grant references on table "public"."accounts" to "anon";

grant select on table "public"."accounts" to "anon";

grant trigger on table "public"."accounts" to "anon";

grant truncate on table "public"."accounts" to "anon";

grant update on table "public"."accounts" to "anon";

grant delete on table "public"."accounts" to "authenticated";

grant insert on table "public"."accounts" to "authenticated";

grant references on table "public"."accounts" to "authenticated";

grant select on table "public"."accounts" to "authenticated";

grant trigger on table "public"."accounts" to "authenticated";

grant truncate on table "public"."accounts" to "authenticated";

grant update on table "public"."accounts" to "authenticated";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant references on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant trigger on table "public"."accounts" to "service_role";

grant truncate on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

grant delete on table "public"."app_settings" to "anon";

grant insert on table "public"."app_settings" to "anon";

grant references on table "public"."app_settings" to "anon";

grant select on table "public"."app_settings" to "anon";

grant trigger on table "public"."app_settings" to "anon";

grant truncate on table "public"."app_settings" to "anon";

grant update on table "public"."app_settings" to "anon";

grant delete on table "public"."app_settings" to "authenticated";

grant insert on table "public"."app_settings" to "authenticated";

grant references on table "public"."app_settings" to "authenticated";

grant select on table "public"."app_settings" to "authenticated";

grant trigger on table "public"."app_settings" to "authenticated";

grant truncate on table "public"."app_settings" to "authenticated";

grant update on table "public"."app_settings" to "authenticated";

grant delete on table "public"."app_settings" to "service_role";

grant insert on table "public"."app_settings" to "service_role";

grant references on table "public"."app_settings" to "service_role";

grant select on table "public"."app_settings" to "service_role";

grant trigger on table "public"."app_settings" to "service_role";

grant truncate on table "public"."app_settings" to "service_role";

grant update on table "public"."app_settings" to "service_role";

grant delete on table "public"."bank_cashbacks_snapshots" to "anon";

grant insert on table "public"."bank_cashbacks_snapshots" to "anon";

grant references on table "public"."bank_cashbacks_snapshots" to "anon";

grant select on table "public"."bank_cashbacks_snapshots" to "anon";

grant trigger on table "public"."bank_cashbacks_snapshots" to "anon";

grant truncate on table "public"."bank_cashbacks_snapshots" to "anon";

grant update on table "public"."bank_cashbacks_snapshots" to "anon";

grant delete on table "public"."bank_cashbacks_snapshots" to "authenticated";

grant insert on table "public"."bank_cashbacks_snapshots" to "authenticated";

grant references on table "public"."bank_cashbacks_snapshots" to "authenticated";

grant select on table "public"."bank_cashbacks_snapshots" to "authenticated";

grant trigger on table "public"."bank_cashbacks_snapshots" to "authenticated";

grant truncate on table "public"."bank_cashbacks_snapshots" to "authenticated";

grant update on table "public"."bank_cashbacks_snapshots" to "authenticated";

grant delete on table "public"."bank_cashbacks_snapshots" to "service_role";

grant insert on table "public"."bank_cashbacks_snapshots" to "service_role";

grant references on table "public"."bank_cashbacks_snapshots" to "service_role";

grant select on table "public"."bank_cashbacks_snapshots" to "service_role";

grant trigger on table "public"."bank_cashbacks_snapshots" to "service_role";

grant truncate on table "public"."bank_cashbacks_snapshots" to "service_role";

grant update on table "public"."bank_cashbacks_snapshots" to "service_role";

grant delete on table "public"."budgets" to "anon";

grant insert on table "public"."budgets" to "anon";

grant references on table "public"."budgets" to "anon";

grant select on table "public"."budgets" to "anon";

grant trigger on table "public"."budgets" to "anon";

grant truncate on table "public"."budgets" to "anon";

grant update on table "public"."budgets" to "anon";

grant delete on table "public"."budgets" to "authenticated";

grant insert on table "public"."budgets" to "authenticated";

grant references on table "public"."budgets" to "authenticated";

grant select on table "public"."budgets" to "authenticated";

grant trigger on table "public"."budgets" to "authenticated";

grant truncate on table "public"."budgets" to "authenticated";

grant update on table "public"."budgets" to "authenticated";

grant delete on table "public"."budgets" to "service_role";

grant insert on table "public"."budgets" to "service_role";

grant references on table "public"."budgets" to "service_role";

grant select on table "public"."budgets" to "service_role";

grant trigger on table "public"."budgets" to "service_role";

grant truncate on table "public"."budgets" to "service_role";

grant update on table "public"."budgets" to "service_role";

grant delete on table "public"."card_transfers" to "anon";

grant insert on table "public"."card_transfers" to "anon";

grant references on table "public"."card_transfers" to "anon";

grant select on table "public"."card_transfers" to "anon";

grant trigger on table "public"."card_transfers" to "anon";

grant truncate on table "public"."card_transfers" to "anon";

grant update on table "public"."card_transfers" to "anon";

grant delete on table "public"."card_transfers" to "authenticated";

grant insert on table "public"."card_transfers" to "authenticated";

grant references on table "public"."card_transfers" to "authenticated";

grant select on table "public"."card_transfers" to "authenticated";

grant trigger on table "public"."card_transfers" to "authenticated";

grant truncate on table "public"."card_transfers" to "authenticated";

grant update on table "public"."card_transfers" to "authenticated";

grant delete on table "public"."card_transfers" to "service_role";

grant insert on table "public"."card_transfers" to "service_role";

grant references on table "public"."card_transfers" to "service_role";

grant select on table "public"."card_transfers" to "service_role";

grant trigger on table "public"."card_transfers" to "service_role";

grant truncate on table "public"."card_transfers" to "service_role";

grant update on table "public"."card_transfers" to "service_role";

grant delete on table "public"."cashback_programs" to "anon";

grant insert on table "public"."cashback_programs" to "anon";

grant references on table "public"."cashback_programs" to "anon";

grant select on table "public"."cashback_programs" to "anon";

grant trigger on table "public"."cashback_programs" to "anon";

grant truncate on table "public"."cashback_programs" to "anon";

grant update on table "public"."cashback_programs" to "anon";

grant delete on table "public"."cashback_programs" to "authenticated";

grant insert on table "public"."cashback_programs" to "authenticated";

grant references on table "public"."cashback_programs" to "authenticated";

grant select on table "public"."cashback_programs" to "authenticated";

grant trigger on table "public"."cashback_programs" to "authenticated";

grant truncate on table "public"."cashback_programs" to "authenticated";

grant update on table "public"."cashback_programs" to "authenticated";

grant delete on table "public"."cashback_programs" to "service_role";

grant insert on table "public"."cashback_programs" to "service_role";

grant references on table "public"."cashback_programs" to "service_role";

grant select on table "public"."cashback_programs" to "service_role";

grant trigger on table "public"."cashback_programs" to "service_role";

grant truncate on table "public"."cashback_programs" to "service_role";

grant update on table "public"."cashback_programs" to "service_role";

grant delete on table "public"."cashback_update_log" to "anon";

grant insert on table "public"."cashback_update_log" to "anon";

grant references on table "public"."cashback_update_log" to "anon";

grant select on table "public"."cashback_update_log" to "anon";

grant trigger on table "public"."cashback_update_log" to "anon";

grant truncate on table "public"."cashback_update_log" to "anon";

grant update on table "public"."cashback_update_log" to "anon";

grant delete on table "public"."cashback_update_log" to "authenticated";

grant insert on table "public"."cashback_update_log" to "authenticated";

grant references on table "public"."cashback_update_log" to "authenticated";

grant select on table "public"."cashback_update_log" to "authenticated";

grant trigger on table "public"."cashback_update_log" to "authenticated";

grant truncate on table "public"."cashback_update_log" to "authenticated";

grant update on table "public"."cashback_update_log" to "authenticated";

grant delete on table "public"."cashback_update_log" to "service_role";

grant insert on table "public"."cashback_update_log" to "service_role";

grant references on table "public"."cashback_update_log" to "service_role";

grant select on table "public"."cashback_update_log" to "service_role";

grant trigger on table "public"."cashback_update_log" to "service_role";

grant truncate on table "public"."cashback_update_log" to "service_role";

grant update on table "public"."cashback_update_log" to "service_role";

grant delete on table "public"."debts" to "anon";

grant insert on table "public"."debts" to "anon";

grant references on table "public"."debts" to "anon";

grant select on table "public"."debts" to "anon";

grant trigger on table "public"."debts" to "anon";

grant truncate on table "public"."debts" to "anon";

grant update on table "public"."debts" to "anon";

grant delete on table "public"."debts" to "authenticated";

grant insert on table "public"."debts" to "authenticated";

grant references on table "public"."debts" to "authenticated";

grant select on table "public"."debts" to "authenticated";

grant trigger on table "public"."debts" to "authenticated";

grant truncate on table "public"."debts" to "authenticated";

grant update on table "public"."debts" to "authenticated";

grant delete on table "public"."debts" to "service_role";

grant insert on table "public"."debts" to "service_role";

grant references on table "public"."debts" to "service_role";

grant select on table "public"."debts" to "service_role";

grant trigger on table "public"."debts" to "service_role";

grant truncate on table "public"."debts" to "service_role";

grant update on table "public"."debts" to "service_role";

grant delete on table "public"."fm_categories" to "anon";

grant insert on table "public"."fm_categories" to "anon";

grant references on table "public"."fm_categories" to "anon";

grant select on table "public"."fm_categories" to "anon";

grant trigger on table "public"."fm_categories" to "anon";

grant truncate on table "public"."fm_categories" to "anon";

grant update on table "public"."fm_categories" to "anon";

grant delete on table "public"."fm_categories" to "authenticated";

grant insert on table "public"."fm_categories" to "authenticated";

grant references on table "public"."fm_categories" to "authenticated";

grant select on table "public"."fm_categories" to "authenticated";

grant trigger on table "public"."fm_categories" to "authenticated";

grant truncate on table "public"."fm_categories" to "authenticated";

grant update on table "public"."fm_categories" to "authenticated";

grant delete on table "public"."fm_categories" to "service_role";

grant insert on table "public"."fm_categories" to "service_role";

grant references on table "public"."fm_categories" to "service_role";

grant select on table "public"."fm_categories" to "service_role";

grant trigger on table "public"."fm_categories" to "service_role";

grant truncate on table "public"."fm_categories" to "service_role";

grant update on table "public"."fm_categories" to "service_role";

grant delete on table "public"."fm_invoices" to "anon";

grant insert on table "public"."fm_invoices" to "anon";

grant references on table "public"."fm_invoices" to "anon";

grant select on table "public"."fm_invoices" to "anon";

grant trigger on table "public"."fm_invoices" to "anon";

grant truncate on table "public"."fm_invoices" to "anon";

grant update on table "public"."fm_invoices" to "anon";

grant delete on table "public"."fm_invoices" to "authenticated";

grant insert on table "public"."fm_invoices" to "authenticated";

grant references on table "public"."fm_invoices" to "authenticated";

grant select on table "public"."fm_invoices" to "authenticated";

grant trigger on table "public"."fm_invoices" to "authenticated";

grant truncate on table "public"."fm_invoices" to "authenticated";

grant update on table "public"."fm_invoices" to "authenticated";

grant delete on table "public"."fm_invoices" to "service_role";

grant insert on table "public"."fm_invoices" to "service_role";

grant references on table "public"."fm_invoices" to "service_role";

grant select on table "public"."fm_invoices" to "service_role";

grant trigger on table "public"."fm_invoices" to "service_role";

grant truncate on table "public"."fm_invoices" to "service_role";

grant update on table "public"."fm_invoices" to "service_role";

grant delete on table "public"."fm_settings" to "anon";

grant insert on table "public"."fm_settings" to "anon";

grant references on table "public"."fm_settings" to "anon";

grant select on table "public"."fm_settings" to "anon";

grant trigger on table "public"."fm_settings" to "anon";

grant truncate on table "public"."fm_settings" to "anon";

grant update on table "public"."fm_settings" to "anon";

grant delete on table "public"."fm_settings" to "authenticated";

grant insert on table "public"."fm_settings" to "authenticated";

grant references on table "public"."fm_settings" to "authenticated";

grant select on table "public"."fm_settings" to "authenticated";

grant trigger on table "public"."fm_settings" to "authenticated";

grant truncate on table "public"."fm_settings" to "authenticated";

grant update on table "public"."fm_settings" to "authenticated";

grant delete on table "public"."fm_settings" to "service_role";

grant insert on table "public"."fm_settings" to "service_role";

grant references on table "public"."fm_settings" to "service_role";

grant select on table "public"."fm_settings" to "service_role";

grant trigger on table "public"."fm_settings" to "service_role";

grant truncate on table "public"."fm_settings" to "service_role";

grant update on table "public"."fm_settings" to "service_role";

grant delete on table "public"."goals" to "anon";

grant insert on table "public"."goals" to "anon";

grant references on table "public"."goals" to "anon";

grant select on table "public"."goals" to "anon";

grant trigger on table "public"."goals" to "anon";

grant truncate on table "public"."goals" to "anon";

grant update on table "public"."goals" to "anon";

grant delete on table "public"."goals" to "authenticated";

grant insert on table "public"."goals" to "authenticated";

grant references on table "public"."goals" to "authenticated";

grant select on table "public"."goals" to "authenticated";

grant trigger on table "public"."goals" to "authenticated";

grant truncate on table "public"."goals" to "authenticated";

grant update on table "public"."goals" to "authenticated";

grant delete on table "public"."goals" to "service_role";

grant insert on table "public"."goals" to "service_role";

grant references on table "public"."goals" to "service_role";

grant select on table "public"."goals" to "service_role";

grant trigger on table "public"."goals" to "service_role";

grant truncate on table "public"."goals" to "service_role";

grant update on table "public"."goals" to "service_role";

grant delete on table "public"."monthly_budgets" to "anon";

grant insert on table "public"."monthly_budgets" to "anon";

grant references on table "public"."monthly_budgets" to "anon";

grant select on table "public"."monthly_budgets" to "anon";

grant trigger on table "public"."monthly_budgets" to "anon";

grant truncate on table "public"."monthly_budgets" to "anon";

grant update on table "public"."monthly_budgets" to "anon";

grant delete on table "public"."monthly_budgets" to "authenticated";

grant insert on table "public"."monthly_budgets" to "authenticated";

grant references on table "public"."monthly_budgets" to "authenticated";

grant select on table "public"."monthly_budgets" to "authenticated";

grant trigger on table "public"."monthly_budgets" to "authenticated";

grant truncate on table "public"."monthly_budgets" to "authenticated";

grant update on table "public"."monthly_budgets" to "authenticated";

grant delete on table "public"."monthly_budgets" to "service_role";

grant insert on table "public"."monthly_budgets" to "service_role";

grant references on table "public"."monthly_budgets" to "service_role";

grant select on table "public"."monthly_budgets" to "service_role";

grant trigger on table "public"."monthly_budgets" to "service_role";

grant truncate on table "public"."monthly_budgets" to "service_role";

grant update on table "public"."monthly_budgets" to "service_role";

grant delete on table "public"."monthly_reports" to "anon";

grant insert on table "public"."monthly_reports" to "anon";

grant references on table "public"."monthly_reports" to "anon";

grant select on table "public"."monthly_reports" to "anon";

grant trigger on table "public"."monthly_reports" to "anon";

grant truncate on table "public"."monthly_reports" to "anon";

grant update on table "public"."monthly_reports" to "anon";

grant delete on table "public"."monthly_reports" to "authenticated";

grant insert on table "public"."monthly_reports" to "authenticated";

grant references on table "public"."monthly_reports" to "authenticated";

grant select on table "public"."monthly_reports" to "authenticated";

grant trigger on table "public"."monthly_reports" to "authenticated";

grant truncate on table "public"."monthly_reports" to "authenticated";

grant update on table "public"."monthly_reports" to "authenticated";

grant delete on table "public"."monthly_reports" to "service_role";

grant insert on table "public"."monthly_reports" to "service_role";

grant references on table "public"."monthly_reports" to "service_role";

grant select on table "public"."monthly_reports" to "service_role";

grant trigger on table "public"."monthly_reports" to "service_role";

grant truncate on table "public"."monthly_reports" to "service_role";

grant update on table "public"."monthly_reports" to "service_role";

grant delete on table "public"."notification_analytics" to "anon";

grant insert on table "public"."notification_analytics" to "anon";

grant references on table "public"."notification_analytics" to "anon";

grant select on table "public"."notification_analytics" to "anon";

grant trigger on table "public"."notification_analytics" to "anon";

grant truncate on table "public"."notification_analytics" to "anon";

grant update on table "public"."notification_analytics" to "anon";

grant delete on table "public"."notification_analytics" to "authenticated";

grant insert on table "public"."notification_analytics" to "authenticated";

grant references on table "public"."notification_analytics" to "authenticated";

grant select on table "public"."notification_analytics" to "authenticated";

grant trigger on table "public"."notification_analytics" to "authenticated";

grant truncate on table "public"."notification_analytics" to "authenticated";

grant update on table "public"."notification_analytics" to "authenticated";

grant delete on table "public"."notification_analytics" to "service_role";

grant insert on table "public"."notification_analytics" to "service_role";

grant references on table "public"."notification_analytics" to "service_role";

grant select on table "public"."notification_analytics" to "service_role";

grant trigger on table "public"."notification_analytics" to "service_role";

grant truncate on table "public"."notification_analytics" to "service_role";

grant update on table "public"."notification_analytics" to "service_role";

grant delete on table "public"."notification_preferences" to "anon";

grant insert on table "public"."notification_preferences" to "anon";

grant references on table "public"."notification_preferences" to "anon";

grant select on table "public"."notification_preferences" to "anon";

grant trigger on table "public"."notification_preferences" to "anon";

grant truncate on table "public"."notification_preferences" to "anon";

grant update on table "public"."notification_preferences" to "anon";

grant delete on table "public"."notification_preferences" to "authenticated";

grant insert on table "public"."notification_preferences" to "authenticated";

grant references on table "public"."notification_preferences" to "authenticated";

grant select on table "public"."notification_preferences" to "authenticated";

grant trigger on table "public"."notification_preferences" to "authenticated";

grant truncate on table "public"."notification_preferences" to "authenticated";

grant update on table "public"."notification_preferences" to "authenticated";

grant delete on table "public"."notification_preferences" to "service_role";

grant insert on table "public"."notification_preferences" to "service_role";

grant references on table "public"."notification_preferences" to "service_role";

grant select on table "public"."notification_preferences" to "service_role";

grant trigger on table "public"."notification_preferences" to "service_role";

grant truncate on table "public"."notification_preferences" to "service_role";

grant update on table "public"."notification_preferences" to "service_role";

grant delete on table "public"."notifications_queue" to "anon";

grant insert on table "public"."notifications_queue" to "anon";

grant references on table "public"."notifications_queue" to "anon";

grant select on table "public"."notifications_queue" to "anon";

grant trigger on table "public"."notifications_queue" to "anon";

grant truncate on table "public"."notifications_queue" to "anon";

grant update on table "public"."notifications_queue" to "anon";

grant delete on table "public"."notifications_queue" to "authenticated";

grant insert on table "public"."notifications_queue" to "authenticated";

grant references on table "public"."notifications_queue" to "authenticated";

grant select on table "public"."notifications_queue" to "authenticated";

grant trigger on table "public"."notifications_queue" to "authenticated";

grant truncate on table "public"."notifications_queue" to "authenticated";

grant update on table "public"."notifications_queue" to "authenticated";

grant delete on table "public"."notifications_queue" to "service_role";

grant insert on table "public"."notifications_queue" to "service_role";

grant references on table "public"."notifications_queue" to "service_role";

grant select on table "public"."notifications_queue" to "service_role";

grant trigger on table "public"."notifications_queue" to "service_role";

grant truncate on table "public"."notifications_queue" to "service_role";

grant update on table "public"."notifications_queue" to "service_role";

grant delete on table "public"."pending_topups" to "anon";

grant insert on table "public"."pending_topups" to "anon";

grant references on table "public"."pending_topups" to "anon";

grant select on table "public"."pending_topups" to "anon";

grant trigger on table "public"."pending_topups" to "anon";

grant truncate on table "public"."pending_topups" to "anon";

grant update on table "public"."pending_topups" to "anon";

grant delete on table "public"."pending_topups" to "authenticated";

grant insert on table "public"."pending_topups" to "authenticated";

grant references on table "public"."pending_topups" to "authenticated";

grant select on table "public"."pending_topups" to "authenticated";

grant trigger on table "public"."pending_topups" to "authenticated";

grant truncate on table "public"."pending_topups" to "authenticated";

grant update on table "public"."pending_topups" to "authenticated";

grant delete on table "public"."pending_topups" to "service_role";

grant insert on table "public"."pending_topups" to "service_role";

grant references on table "public"."pending_topups" to "service_role";

grant select on table "public"."pending_topups" to "service_role";

grant trigger on table "public"."pending_topups" to "service_role";

grant truncate on table "public"."pending_topups" to "service_role";

grant update on table "public"."pending_topups" to "service_role";

grant delete on table "public"."savings_goals" to "anon";

grant insert on table "public"."savings_goals" to "anon";

grant references on table "public"."savings_goals" to "anon";

grant select on table "public"."savings_goals" to "anon";

grant trigger on table "public"."savings_goals" to "anon";

grant truncate on table "public"."savings_goals" to "anon";

grant update on table "public"."savings_goals" to "anon";

grant delete on table "public"."savings_goals" to "authenticated";

grant insert on table "public"."savings_goals" to "authenticated";

grant references on table "public"."savings_goals" to "authenticated";

grant select on table "public"."savings_goals" to "authenticated";

grant trigger on table "public"."savings_goals" to "authenticated";

grant truncate on table "public"."savings_goals" to "authenticated";

grant update on table "public"."savings_goals" to "authenticated";

grant delete on table "public"."savings_goals" to "service_role";

grant insert on table "public"."savings_goals" to "service_role";

grant references on table "public"."savings_goals" to "service_role";

grant select on table "public"."savings_goals" to "service_role";

grant trigger on table "public"."savings_goals" to "service_role";

grant truncate on table "public"."savings_goals" to "service_role";

grant update on table "public"."savings_goals" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."telegram_auth_tokens" to "anon";

grant insert on table "public"."telegram_auth_tokens" to "anon";

grant select on table "public"."telegram_auth_tokens" to "anon";

grant update on table "public"."telegram_auth_tokens" to "anon";

grant delete on table "public"."telegram_auth_tokens" to "authenticated";

grant insert on table "public"."telegram_auth_tokens" to "authenticated";

grant select on table "public"."telegram_auth_tokens" to "authenticated";

grant update on table "public"."telegram_auth_tokens" to "authenticated";

grant delete on table "public"."telegram_users" to "anon";

grant insert on table "public"."telegram_users" to "anon";

grant select on table "public"."telegram_users" to "anon";

grant update on table "public"."telegram_users" to "anon";

grant delete on table "public"."telegram_users" to "authenticated";

grant insert on table "public"."telegram_users" to "authenticated";

grant select on table "public"."telegram_users" to "authenticated";

grant update on table "public"."telegram_users" to "authenticated";

grant delete on table "public"."transactions" to "anon";

grant insert on table "public"."transactions" to "anon";

grant references on table "public"."transactions" to "anon";

grant select on table "public"."transactions" to "anon";

grant trigger on table "public"."transactions" to "anon";

grant truncate on table "public"."transactions" to "anon";

grant update on table "public"."transactions" to "anon";

grant delete on table "public"."transactions" to "authenticated";

grant insert on table "public"."transactions" to "authenticated";

grant references on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant trigger on table "public"."transactions" to "authenticated";

grant truncate on table "public"."transactions" to "authenticated";

grant update on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."virtual_cards" to "anon";

grant insert on table "public"."virtual_cards" to "anon";

grant references on table "public"."virtual_cards" to "anon";

grant select on table "public"."virtual_cards" to "anon";

grant trigger on table "public"."virtual_cards" to "anon";

grant truncate on table "public"."virtual_cards" to "anon";

grant update on table "public"."virtual_cards" to "anon";

grant delete on table "public"."virtual_cards" to "authenticated";

grant insert on table "public"."virtual_cards" to "authenticated";

grant references on table "public"."virtual_cards" to "authenticated";

grant select on table "public"."virtual_cards" to "authenticated";

grant trigger on table "public"."virtual_cards" to "authenticated";

grant truncate on table "public"."virtual_cards" to "authenticated";

grant update on table "public"."virtual_cards" to "authenticated";

grant delete on table "public"."virtual_cards" to "service_role";

grant insert on table "public"."virtual_cards" to "service_role";

grant references on table "public"."virtual_cards" to "service_role";

grant select on table "public"."virtual_cards" to "service_role";

grant trigger on table "public"."virtual_cards" to "service_role";

grant truncate on table "public"."virtual_cards" to "service_role";

grant update on table "public"."virtual_cards" to "service_role";


  create policy "accounts_user_policy"
  on "public"."accounts"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "public read snapshots"
  on "public"."bank_cashbacks_snapshots"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "public read logs"
  on "public"."cashback_update_log"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Users manage own categories"
  on "public"."fm_categories"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own invoices"
  on "public"."fm_invoices"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own settings"
  on "public"."fm_settings"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "monthly_budgets_user_policy"
  on "public"."monthly_budgets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "savings_goals_user_policy"
  on "public"."savings_goals"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users read own subscription"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "transactions_user_policy"
  on "public"."transactions"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER trg_deactivate_previous AFTER INSERT ON public.bank_cashbacks_snapshots FOR EACH ROW EXECUTE FUNCTION public.deactivate_previous_snapshots();

CREATE TRIGGER trg_mb_updated_at BEFORE UPDATE ON public.monthly_budgets FOR EACH ROW EXECUTE FUNCTION public.monthly_budgets_set_updated_at();

CREATE TRIGGER notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_sg_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.savings_goals_set_updated_at();

CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


