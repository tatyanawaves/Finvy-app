import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://woelxkjfbjgazcbozrak.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZWx4a2pmYmpnYXpjYm96cmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTY1NjAsImV4cCI6MjA4ODEzMjU2MH0.-yL5Pyw1VeNpkAAJwuBTbJtg5yKrcYPwMN3r1_e6mws'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
