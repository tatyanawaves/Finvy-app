create table "public"."recurring_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "description" text not null,
    "amount" numeric not null,
    "category" text,
    "account_id" uuid,
    "frequency" text not null, -- 'daily', 'weekly', 'monthly', 'yearly'
    "interval" integer not null default 1,
    "start_date" date not null default now(),
    "next_execution" date not null,
    "last_executed" date,
    "status" text not null default 'active', -- 'active', 'paused'
    "type" text not null default 'expense' -- 'expense', 'income'
);

alter table "public"."recurring_transactions" enable row level security;

CREATE UNIQUE INDEX recurring_transactions_pkey ON public.recurring_transactions USING btree (id);

alter table "public"."recurring_transactions" add constraint "recurring_transactions_pkey" PRIMARY KEY using index "recurring_transactions_pkey";

alter table "public"."recurring_transactions" add constraint "recurring_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."recurring_transactions" validate constraint "recurring_transactions_user_id_fkey";

create policy "Users can manage their own recurring transactions"
on "public"."recurring_transactions"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));
