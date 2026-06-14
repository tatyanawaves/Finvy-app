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

    // 1. Привязка аккаунта
    if (text.startsWith('/start ')) {
      const token = text.split(' ')[1]
      const { data: linkData } = await supabase.from('telegram_users_links').select('user_id').eq('token', token).maybeSingle()
      if (linkData) {
        await supabase.from('telegram_users_links').update({ chat_id: chatId, token: null }).eq('user_id', linkData.user_id)
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: '✅ Аккаунт успешно привязан! Я буду помогать вам следить за финансами.' })
        })
        return new Response(JSON.stringify({ ok: true }))
      }
    }

    // 2. Поиск пользователя
    const { data: user } = await supabase.from('telegram_users_links').select('user_id, language').eq('chat_id', chatId).maybeSingle()

    if (user) {
      if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY missing")

      // Получаем настройки валюты пользователя
      const { data: settings } = await supabase.from('fm_settings').select('default_currency').eq('user_id', user.user_id).maybeSingle()
      const userCurrency = settings?.default_currency || 'KZT'
      const currencySymbol = userCurrency === 'KZT' ? '₸' : userCurrency === 'USD' ? '$' : userCurrency;

      const userLang = user.language || 'ru';
      const langNames = { ru: 'Russian', en: 'English', kk: 'Kazakh' };
      const currentLangName = langNames[userLang] || 'Russian';

      // Собираем контекст для ответов на вопросы о положении
      const { data: balance } = await supabase.rpc('get_user_balance', { p_user_id: user.user_id })
      const { data: recentTransactions } = await supabase.from('transactions').select('*').eq('user_id', user.user_id).order('date', { ascending: false }).limit(5)
      const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', user.user_id)

      const financialContext = `
        Current Balance: ${balance || 0} ${userCurrency}
        User's Default Currency: ${userCurrency}
        Recent transactions: ${JSON.stringify(recentTransactions)}
        Savings goals: ${JSON.stringify(goals)}
      `

      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [
            { 
              role: 'system', 
              content: `You are a financial assistant. 
              
              If the user wants to record a transaction or goal, ALWAYS return ONLY JSON.
              JSON formats:
              1. Transaction: {"action":"transaction","amount":number,"description":"string","type":"expense"|"income","category":"string"}
              2. Goal: {"action":"goal_deposit","amount":number,"goal_name":"string"}
              3. New Goal: {"action":"goal_create","target_amount":number,"goal_name":"string"}
              
              IMPORTANT RULES:
              - Always start "description" and "goal_name" with a CAPITAL LETTER.
              - Use currency: ${userCurrency} (${currencySymbol}).
              - Use language: ${currentLangName}.
              
              If the user asks a question about their finances, answer naturally using this context:
              ${financialContext}
              In your natural answer, be concise and helpful in ${currentLangName}. Use ${currencySymbol} for amounts.`
            },
            { role: 'user', content: text }
          ]
        }),
      })

      const aiDataRaw = await aiResponse.json()
      const aiContent = aiDataRaw.choices?.[0]?.message?.content || '{}'
      
      let reply = 'Не удалось обработать запрос.'
      
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0])
          
          if (aiData.action === 'transaction') {
            const { data: accounts } = await supabase.from('accounts').select('id').eq('user_id', user.user_id).limit(1)

            const finalDesc = (aiData.description || text).trim()
            const capitalizedDesc = finalDesc.charAt(0).toUpperCase() + finalDesc.slice(1)

            const { error: insErr } = await supabase.from('transactions').insert({
              user_id: user.user_id,
              type: aiData.type || 'expense',
              amount: aiData.amount,
              description: capitalizedDesc,
              category: aiData.category || 'Telegram',
              date: new Date().toISOString().slice(0, 10),
              accountId: accounts?.[0]?.id
            })
            reply = insErr ? `❌ Ошибка БД: ${insErr.message}` : `✅ Добавлено: ${capitalizedDesc} (${aiData.amount} ${currencySymbol})`
            
          } else if (aiData.action === 'goal_deposit') {
            const { data: goal } = await supabase.from('savings_goals').select('id, saved_amount, name').eq('user_id', user.user_id).ilike('name', `%${aiData.goal_name}%`).maybeSingle()
            if (goal) {
              const newAmount = (goal.saved_amount || 0) + aiData.amount
              await supabase.from('savings_goals').update({ saved_amount: newAmount }).eq('id', goal.id)
              reply = `🎯 Цель "${goal.name}" пополнена на ${aiData.amount} ${currencySymbol}.`
            } else {
              reply = `❌ Цель "${aiData.goal_name}" не найдена.`
            }
          } else if (aiData.action === 'goal_create') {
            const finalGoalName = aiData.goal_name.trim()
            const capitalizedGoalName = finalGoalName.charAt(0).toUpperCase() + finalGoalName.slice(1)
            await supabase.from('savings_goals').insert({ user_id: user.user_id, name: capitalizedGoalName, target_amount: aiData.target_amount, saved_amount: 0 })
            reply = `✨ Цель создана: "${capitalizedGoalName}" (${aiData.target_amount} ${currencySymbol})`
          } else {
            reply = aiData.reply || aiContent
          }
        } else {
          reply = aiContent // Natural language response
        }
      } catch (e) {
        reply = aiContent
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
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
