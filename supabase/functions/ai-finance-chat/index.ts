import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

serve(async (req) => {
  try {
    const { messages, userId, language = 'ru' } = await req.json()

    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ 
        reply: JSON.stringify({ action: "text", reply: "API ключ OpenRouter не настроен." }) 
      }), { headers: { 'Content-Type': 'application/json' } })
    }

    const systemPrompt = {
      role: 'system',
      content: `You are a financial assistant. Extract transaction data from the user's message.
      ALWAYS return ONLY a JSON object. No conversation, no preamble.
      
      If it's an expense or income:
      {"action": "transaction", "amount": number, "description": "string", "type": "expense" | "income", "category": "string"}
      
      If it's a goal deposit:
      {"action": "goal_deposit", "goal_name": "string", "amount": number}
      
      If you don't understand:
      {"action": "text", "reply": "I couldn't understand that. Please use format: 'Coffee 1000'"}
      
      Current date: ${new Date().toISOString().split('T')[0]}`
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-001",
        messages: [systemPrompt, ...messages],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    const reply = data.choices[0].message.content

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
