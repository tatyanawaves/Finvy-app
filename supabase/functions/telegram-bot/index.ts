import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  try {
    const payload = await req.json()
    if (!payload.message || !payload.message.chat) return new Response(JSON.stringify({ ok: true }))

    const chatId = payload.message.chat.id.toString()
    const text = payload.message.text || ''

    if (text.startsWith('/start ')) {
      const token = text.split(' ')[1]
      const { data: linkData } = await supabase.from('telegram_users_links').select('user_id').eq('token', token).maybeSingle()
      if (linkData) {
        await supabase.from('telegram_users_links').update({ chat_id: chatId, token: null }).eq('user_id', linkData.user_id)
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: '✅ Привязан!' })
        })
        return new Response(JSON.stringify({ ok: true }))
      }
    }
// 2. Поиск пользователя
const { data: user } = await supabase.from('telegram_users_links').select('user_id, language').eq('chat_id', chatId).maybeSingle()

if (user) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in Supabase Secrets")
  }

  const userLang = user.language || 'ru';
  const langNames = { ru: 'Russian', en: 'English', kk: 'Kazakh' };
  const currentLangName = langNames[userLang] || 'Russian';

  const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b:free",
      messages: [
        { 
          role: 'system', 
          content: `You are a financial assistant. Extract data from the message.
          ALWAYS return ONLY a JSON object.

          LANGUAGE RULES:
          - Use ${currentLangName} for "description" and "category".
          - If the user uses a different language, still translate the JSON values to ${currentLangName}.

          1. Transactions (expense/income):
          {"action":"transaction","amount":number,"description":"string","type":"expense"|"income","category":"string"}

          2. Savings Goals (deposit or create):
          {"action":"goal_deposit","amount":number,"goal_name":"string"}
          {"action":"goal_create","target_amount":number,"goal_name":"string"}

          Current date: ${new Date().toISOString().split('T')[0]}` 
        },
        { role: 'user', content: text }
      ],
      response_format: { type: "json_object" }
    }),
  })


      const aiDataRaw = await aiResponse.json()
      const aiContent = aiDataRaw.choices?.[0]?.message?.content || JSON.stringify(aiDataRaw)
      
      let reply = `Не удалось распознать команду. Попробуйте: "Кофе 1000", "Зарплата 50000" или "В цель Машина 5000".`
      
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0])
          
          if (aiData.action === 'transaction') {
            const { data: accounts } = await supabase.from('accounts').select('id').eq('user_id', user.user_id).limit(1)
            const { error: insErr } = await supabase.from('transactions').insert({
              user_id: user.user_id,
              type: aiData.type || 'expense',
              amount: aiData.amount,
              description: aiData.description || text,
              category: aiData.category || 'Telegram',
              date: new Date().toISOString().slice(0, 10),
              accountId: accounts?.[0]?.id
            })
            reply = insErr ? `❌ Ошибка: ${insErr.message}` : `✅ ${aiData.type === 'income' ? 'Доход' : 'Расход'} добавлен: ${aiData.description} (${aiData.amount} ₸)`
            
          } else if (aiData.action === 'goal_deposit') {
            const { data: goal } = await supabase.from('savings_goals').select('id, saved_amount, name').eq('user_id', user.user_id).ilike('name', `%${aiData.goal_name}%`).maybeSingle()
            if (goal) {
              const newAmount = (goal.saved_amount || 0) + aiData.amount
              await supabase.from('savings_goals').update({ saved_amount: newAmount }).eq('id', goal.id)
              reply = `🎯 Цель "${goal.name}" пополнена на ${aiData.amount} ₸. Всего: ${newAmount} ₸.`
            } else {
              reply = `❌ Цель "${aiData.goal_name}" не найдена. Создайте её сначала.`
            }
            
          } else if (aiData.action === 'goal_create') {
            await supabase.from('savings_goals').insert({
              user_id: user.user_id,
              name: aiData.goal_name,
              target_amount: aiData.target_amount,
              saved_amount: 0
            })
            reply = `✨ Новая цель создана: "${aiData.goal_name}" (Цель: ${aiData.target_amount} ₸).`
          }
        }
      } catch (e) {
        reply = `❌ Ошибка: ${e.message}`
      }

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: reply })
      })
    } else {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: '❌ Не привязан.' })
      })
    }
    return new Response(JSON.stringify({ ok: true }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
