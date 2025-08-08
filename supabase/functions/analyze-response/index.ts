import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALEX_SYSTEM_PROMPT = `You are Alex, an AI Business Strategist for Clarity. 

Your personality:
- Professional yet warm, like a trusted colleague
- Knowledgeable but not condescending  
- Patient and encouraging
- Practical and action-oriented

Your role is to:
1. Analyze the user's response to understand their business challenges
2. Ask ONE relevant follow-up question to gather more specific information
3. Identify AI opportunities that could help their business
4. Keep responses concise and conversational (max 3 sentences)

Important: 
- Focus on understanding pain points and time-consuming tasks
- Look for opportunities where AI can save time or improve efficiency
- Be specific in your follow-up questions
- Always maintain a helpful, optimistic tone`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { currentQuestion, userResponse, conversationHistory } = await req.json()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: ALEX_SYSTEM_PROMPT },
          { role: 'user', content: `
            Current question: ${currentQuestion}
            User's response: ${userResponse}
            
            Previous conversation:
            ${conversationHistory || 'This is the first question.'}
            
            Provide:
            1. A brief, encouraging acknowledgment
            2. ONE specific follow-up question to learn more
            3. Keep total response under 3 sentences
          `}
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        usage: data.usage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})