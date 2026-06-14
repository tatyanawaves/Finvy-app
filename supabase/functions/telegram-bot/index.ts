import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const payload = await req.json()
  if (!payload.message || !payload.message.chat) return new Response(JSON.stringify({ ok: true }))

  const chatId = payload.message.chat.id
  const text = payload.message.text || ''

  // 1. Обработка связки аккаунта (/start <token>)
  if (text.startsWith('/start ')) {
    const token = text.split(' ')[1]
    const { data: auth } = await supabase.from('telegram_auth_tokens').select('user_id').eq('token', token).maybeSingle()

    if (auth) {
      await supabase.from('telegram_users').upsert({ user_id: auth.user_id, chat_id: chatId })
      await supabase.from('telegram_auth_tokens').delete().eq('token', token)
      
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: 'Аккаунт успешно привязан!' })
      })
      return new Response(JSON.stringify({ ok: true }))
    }
  }

  // 2. Обработка расходов/доходов (если привязан)
  const { data: user } = await supabase.from('telegram_users').select('user_id').eq('chat_id', chatId).maybeSingle()
  if (user) {
    // Инструктируем AI вернуть JSON
    const prompt = `Ты финансовый ассистент. Если сообщение — транзакция или пополнение цели, верни JSON (без текста до/после).
    Пример транзакции: {"action": "transaction", "amount": 2000, "description": "Обед", "type": "expense", "category": "Еда"}
    Пример цели: {"action": "goal_deposit", "goal_name": "Отпуск", "amount": 5000}
    Иначе просто ответь текстовым полем: {"action": "text", "reply": "..."}
    Сообщение: ${text}`

    const aiResponse = await supabase.functions.invoke('ai-finance-chat', {
      body: { messages: [{ role: 'user', content: prompt }], userId: user.user_id, language: 'ru' }
    })

    let reply = 'Не удалось обработать запрос.'
    try {
      const aiData = JSON.parse(aiResponse.data?.reply || '{}')
      
      if (aiData.action === 'transaction') {
        const { data: accounts } = await supabase.from('accounts').select('id').eq('user_id', user.user_id).limit(1)
        const accountId = accounts?.[0]?.id
        
        await supabase.from('transactions').insert({
          user_id: user.user_id,
          type: aiData.type,
          amount: aiData.amount,
          description: aiData.description,
          category: aiData.category,
          date: new Date().toISOString().slice(0, 10),
          accountId: accountId
        })
        reply = `Транзакция добавлена: ${aiData.description} (${aiData.amount} ₸)`
      } else if (aiData.action === 'goal_deposit') {
        const { data: goal } = await supabase.from('savings_goals').select('id, saved_amount').eq('user_id', user.user_id).ilike('name', `%${aiData.goal_name}%`).maybeSingle()
        if (goal) {
          await supabase.from('savings_goals').update({ saved_amount: goal.saved_amount + aiData.amount }).eq('id', goal.id)
          reply = `Пополнение цели "${aiData.goal_name}" на ${aiData.amount} ₸ успешно.`
        } else {
          reply = `Цель "${aiData.goal_name}" не найдена.`
        }
      } else {
        reply = aiData.reply || 'Не удалось обработать запрос.'
      }
    } catch (e) {
      reply = aiResponse.data?.reply || 'Не удалось обработать запрос.'
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    })
  } else {
    // Если пользователь не привязан
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'Аккаунт не связан. Пожалуйста, привяжите аккаунт в настройках приложения.'
        })
    })
  }

  return new Response(JSON.stringify({ ok: true }))
})
