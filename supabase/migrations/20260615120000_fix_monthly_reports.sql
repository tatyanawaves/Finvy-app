-- Fix monthly_reports table
alter table "public"."monthly_reports" add column "user_id" uuid references auth.users(id) on delete cascade;

-- Enable RLS
alter table "public"."monthly_reports" enable row level security;

-- Policies
create policy "Users can manage their own monthly reports"
on "public"."monthly_reports"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));

-- Grant access to service_role
grant all on table "public"."monthly_reports" to service_role;
