import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { assessmentData } = await req.json()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI consultant creating a comprehensive business report. 
            Analyze the conversation and provide specific, actionable AI recommendations.
            Focus on practical solutions with clear ROI potential.` 
          },
          { 
            role: 'user', 
            content: `Based on this business assessment conversation:
            ${JSON.stringify(assessmentData)}
            
            Create a structured report with:
            1. Executive Summary (2-3 sentences)
            2. Top 3 AI Opportunities (specific tools/solutions)
            3. Implementation Roadmap (30, 60, 90 day plan)
            4. Estimated Time Savings (hours per week)
            5. Recommended Tools (specific products)
            6. Next Steps (3-5 action items)
            
            Format as JSON for easy parsing with these exact keys:
            {
              "executiveSummary": "...",
              "opportunities": [{"title": "...", "description": "...", "timeSavings": "..."}],
              "roadmap": {"30days": "...", "60days": "...", "90days": "..."},
              "timeSavings": "...",
              "recommendedTools": ["tool1", "tool2"],
              "nextSteps": ["step1", "step2"]
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    let reportContent;
    
    try {
      reportContent = JSON.parse(data.choices[0].message.content)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      reportContent = {
        executiveSummary: data.choices[0].message.content,
        opportunities: [],
        roadmap: {},
        timeSavings: "To be determined",
        recommendedTools: [],
        nextSteps: []
      }
    }

    return new Response(
      JSON.stringify({ report: reportContent }),
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