import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  try {
    const { data: users } = await supabase.from('telegram_users_links').select('user_id, chat_id, language').not('chat_id', 'is', null)
    if (!users) return new Response("No users", { status: 200 })

    const today = new Date().toISOString().split('T')[0]
    const isFirstOfMonth = new Date().getDate() === 1

    for (const user of users) {
      const userLang = user.language || 'ru'
      const langNames = { ru: 'Russian', en: 'English', kk: 'Kazakh' }
      
      // Get User Currency
      const { data: settings } = await supabase.from('fm_settings').select('default_currency').eq('user_id', user.user_id).maybeSingle()
      const userCurrency = settings?.default_currency || 'KZT'
      const currencySymbol = userCurrency === 'KZT' ? '₸' : userCurrency === 'USD' ? '$' : userCurrency;
      
      // 1. Transactions today
      const { data: dailyTx } = await supabase.from('transactions').select('*').eq('user_id', user.user_id).eq('date', today)
      const income = dailyTx?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0
      const expense = dailyTx?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0

      // 2. Calendar Reminders (Mandatory payments from survey)
      const { data: settings } = await supabase.from('fm_settings').select('survey_data').eq('user_id', user.user_id).maybeSingle()
      const survey = typeof settings?.survey_data === 'string' ? JSON.parse(settings.survey_data) : settings?.survey_data
      const currentDay = new Date().getDate()
      const reminders = (survey?.monthlyObligations || []).filter(o => Number(o.day) === currentDay && o.enabled !== false)

      // 3. Goals status
      const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', user.user_id)

      // 4. Monthly analytics (if it's 1st of month)
      let monthlyStats = ""
      if (isFirstOfMonth) {
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        const from = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2,'0')}-01`
        const { data: monthlyTx } = await supabase.from('transactions').select('*').eq('user_id', user.user_id).gte('date', from).lt('date', today)
        monthlyStats = `Last Month Stats: ${JSON.stringify(monthlyTx)}`
      }

      const prompt = `
        Generate a financial report in ${langNames[userLang] || 'Russian'}.
        Type: ${isFirstOfMonth ? 'Monthly Analytics & Daily Report' : 'Daily Report'}
        
        Currency: ${userCurrency} (${currencySymbol})
        Today's Income: ${income} ${currencySymbol}
        Today's Expense: ${expense} ${currencySymbol}
        Reminders for today: ${JSON.stringify(reminders)}
        Goals: ${JSON.stringify(goals)}
        ${monthlyStats}
        
        Guidelines:
        - Be professional and encouraging.
        - Start all descriptions and names with a CAPITAL LETTER.
        - Mention mandatory payments if any.
        - Summarize savings progress.
        - ALWAYS USE ${currencySymbol} FOR AMOUNTS.
      `

      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [{ role: 'user', content: prompt }]
        }),
      })

      const aiData = await aiRes.json()
      const report = aiData.choices?.[0]?.message?.content || "Report error"

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: user.chat_id, text: report })
      })
    }
    return new Response("OK", { status: 200 })
  } catch (err) {
    return new Response(err.message, { status: 500 })
  }
})
