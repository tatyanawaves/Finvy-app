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

    const chatId = payload.message?.chat?.id?.toString() || payload.callback_query?.message?.chat?.id?.toString()
    const text = payload.message?.text || ''
    const callbackData = payload.callback_query?.data

    if (!chatId) return new Response(JSON.stringify({ ok: true }))

    // 0. Handle account selection callbacks
    if (callbackData?.startsWith('select_account_')) {
      const [_, txId, accountId] = callbackData.split('_').slice(1) // select_account_TXID_ACCID
      
      const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).maybeSingle()
      if (tx) {
        await supabase.from('transactions').update({ accountId }).eq('id', txId)
        
        // Update account balance
        const { data: acc } = await supabase.from('accounts').select('balance, name').eq('id', accountId).maybeSingle()
        if (acc) {
          const delta = tx.type === 'income' ? tx.amount : -tx.amount
          await supabase.from('accounts').update({ balance: (acc.balance || 0) + delta }).eq('id', accountId)
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              chat_id: chatId, 
              message_id: payload.callback_query.message.message_id,
              text: `✅ Транзакция "${tx.description}" (${tx.amount} ₸) привязана к счету: ${acc.name}` 
            })
          })
        }
      }
      return new Response(JSON.stringify({ ok: true }))
    }

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
      const { data: accounts } = await supabase.from('accounts').select('id, name, balance, currency').eq('user_id', user.user_id)
      const { data: balance } = await supabase.rpc('get_user_balance', { p_user_id: user.user_id })
      const { data: recentTransactions } = await supabase.from('transactions').select('*').eq('user_id', user.user_id).order('date', { ascending: false }).limit(5)
      const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', user.user_id)
      const { data: debts } = await supabase.from('debts').select('*').eq('user_id', user.user_id)
      const { data: categories } = await supabase.from('fm_categories').select('name, type').eq('user_id', user.user_id)

      const financialContext = `
        Accounts: ${JSON.stringify(accounts)}
        Current Balance: ${balance || 0} ${userCurrency}
        User's Default Currency: ${userCurrency}
        Recent transactions: ${JSON.stringify(recentTransactions)}
        Savings goals: ${JSON.stringify(goals)}
        Current Debts: ${JSON.stringify(debts)}
        Available Categories: ${categories?.map(c => `${c.name} (${c.type})`).join(', ')}
      `

      // Command: /last
      if (text === '/last') {
        const { data: txs } = await supabase
          .from('transactions')
          .select('id, description, amount, date')
          .eq('user_id', user.user_id)
          .order('date', { ascending: false })
          .limit(5);

        let msg = 'Последние транзакции:\n';
        txs?.forEach((tx, i) => {
          msg += `${i + 1}. ${tx.description}: ${tx.amount} ₸ (ID: ${tx.id.substring(0,8)})\n`;
        });
        msg += '\nНапишите "/del <номер>" для удаления.';

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: msg })
        });
        return new Response(JSON.stringify({ ok: true }));
      }

      // Command: /del <number>
      if (text.startsWith('/del ')) {
        const index = parseInt(text.split(' ')[1]) - 1;
        const { data: txs } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.user_id)
          .order('date', { ascending: false })
          .limit(5);

        if (txs && txs[index]) {
          await supabase.from('transactions').delete().eq('id', txs[index].id);
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: '✅ Транзакция удалена.' })
          });
        } else {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: '❌ Не найдено.' })
          });
        }
        return new Response(JSON.stringify({ ok: true }));
      }

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
              1. Transaction: {"action":"transaction","amount":number,"description":"string","type":"expense"|"income","category":"string","account_name":"string"}
              2. Goal Deposit: {"action":"goal_deposit","amount":number,"goal_name":"string"}
              3. Goal Create: {"action":"goal_create","target_amount":number,"goal_name":"string"}
              4. Budget: {"action":"budget_create","amount":number,"category":"string"}
              5. Debt Create: {"action":"debt_create","amount":number,"person":"string","type":"owe_them"|"they_owe","description":"string"}
              6. Debt Pay: {"action":"debt_pay","amount":number,"person":"string"}
              
              IMPORTANT RULES:
              - Always start "description", "goal_name", and "category" with a CAPITAL LETTER.
              - "account_name" MUST match one of the user's accounts if mentioned in text.
              - "category" MUST be one of the available categories if it fits, otherwise pick a suitable name.
              - Available categories: ${categories?.map(c => `${c.name} (${c.type})`).join(', ')}.
              - Available accounts: ${accounts?.map(a => a.name).join(', ')}.
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
            const finalDesc = (aiData.description || text).trim()
            const capitalizedDesc = finalDesc.charAt(0).toUpperCase() + finalDesc.slice(1)
            
            // Try to find category match
            let targetCategory = aiData.category || 'Прочее'
            if (aiData.category && categories) {
              const match = categories.find(c => c.name.toLowerCase() === aiData.category.toLowerCase())
              if (match) targetCategory = match.name
            }

            // Try to find account by name from AI
            let targetAccount = null
            if (aiData.account_name) {
              targetAccount = accounts?.find(a => a.name.toLowerCase().includes(aiData.account_name.toLowerCase()))
            }

            // If account is still not found and we have multiple accounts, ask user
            if (!targetAccount && accounts?.length > 1) {
              // Create transaction without accountId first
              const { data: newTx } = await supabase.from('transactions').insert({
                user_id: user.user_id,
                type: aiData.type || 'expense',
                amount: aiData.amount,
                description: capitalizedDesc,
                category: targetCategory,
                date: new Date().toISOString().slice(0, 10)
              }).select().single()

              if (newTx) {
                const buttons = accounts.map(acc => ([{
                  text: `${acc.name} (${acc.balance} ${acc.currency})`,
                  callback_data: `select_account_${newTx.id}_${acc.id}`
                }]))

                await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    chat_id: chatId, 
                    text: `На какой счет записать "${capitalizedDesc}" (${aiData.amount} ₸)?`,
                    reply_markup: { inline_keyboard: buttons }
                  })
                })
                return new Response(JSON.stringify({ ok: true }))
              }
            }

            // Default to first account if only one or if explicitly found
            const accountId = targetAccount?.id || accounts?.[0]?.id

            const { error: insErr } = await supabase.from('transactions').insert({
              user_id: user.user_id,
              type: aiData.type || 'expense',
              amount: aiData.amount,
              description: capitalizedDesc,
              category: targetCategory,
              date: new Date().toISOString().slice(0, 10),
              accountId: accountId
            })

            if (!insErr && accountId) {
              const acc = accounts.find(a => a.id === accountId)
              const delta = aiData.type === 'income' ? aiData.amount : -aiData.amount
              await supabase.from('accounts').update({ balance: (acc.balance || 0) + delta }).eq('id', accountId)
            }

            reply = insErr ? `❌ Ошибка БД: ${insErr.message}` : `✅ Добавлено [${targetCategory}]: ${capitalizedDesc} (${aiData.amount} ${currencySymbol})`
            
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
          } else if (aiData.action === 'budget_create') {
            const month = new Date().toISOString().slice(0, 7) // '2024-06'
            const cat = aiData.category || 'Прочее'
            const capitalizedCat = cat.charAt(0).toUpperCase() + cat.slice(1)
            const { error: budErr } = await supabase.from('monthly_budgets').upsert({
              user_id: user.user_id,
              month,
              category: capitalizedCat,
              planned_amount: aiData.amount
            }, { onConflict: 'user_id, month, category' })
            reply = budErr ? `❌ Ошибка БД: ${budErr.message}` : `📊 План установлен: ${capitalizedCat} — ${aiData.amount} ${currencySymbol} на ${month}`
          } else if (aiData.action === 'debt_create') {
            const { error: dbtErr } = await supabase.from('debts').insert({
              user_id: user.user_id,
              person: aiData.person,
              amount: aiData.amount,
              type: aiData.type || 'they_owe',
              description: aiData.description
            })
            const typeText = aiData.type === 'owe_them' ? 'Я должен' : 'Мне должны'
            reply = dbtErr ? `❌ Ошибка БД: ${dbtErr.message}` : `🤝 Долг записан: ${aiData.person} (${typeText}: ${aiData.amount} ${currencySymbol})`
          } else if (aiData.action === 'debt_pay') {
            const { data: debt } = await supabase.from('debts').select('*').eq('user_id', user.user_id).ilike('person', `%${aiData.person}%`).maybeSingle()
            if (debt) {
              const newAmount = Math.max(0, debt.amount - aiData.amount)
              if (newAmount === 0) {
                await supabase.from('debts').delete().eq('id', debt.id)
                reply = `✅ Долг от ${debt.person} полностью погашен и удален.`
              } else {
                await supabase.from('debts').update({ amount: newAmount }).eq('id', debt.id)
                reply = `📉 Долг от ${debt.person} уменьшен на ${aiData.amount}. Осталось: ${newAmount} ${currencySymbol}`
              }
            } else {
              reply = `❌ Долг от "${aiData.person}" не найден.`
            }
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
