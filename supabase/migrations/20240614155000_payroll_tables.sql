-- fm_employees: Employee list for payroll calculator
CREATE TABLE IF NOT EXISTS public.fm_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  gross NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fm_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own employees"
  ON public.fm_employees
  FOR ALL
  USING (auth.uid() = user_id);

-- fm_planned_payroll: Summary of planned payroll for analytics
CREATE TABLE IF NOT EXISTS public.fm_planned_payroll (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC DEFAULT 0,
  description TEXT,
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fm_planned_payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payroll plan"
  ON public.fm_planned_payroll
  FOR ALL
  USING (auth.uid() = user_id);
