-- Add user_id to debts table and enable RLS
alter table "public"."debts" add column "user_id" uuid references auth.users(id) on delete cascade;

-- Enable RLS
alter table "public"."debts" enable row level security;

-- Policies
create policy "Users can manage their own debts"
on "public"."debts"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));

-- Grant access to service_role
grant all on table "public"."debts" to service_role;
