export interface AssessmentQuestion {
  id: string;
  text: string;
  helpText?: string;
  category: string;
}

const ALEX_INTRODUCTION = `Hi! I'm Alex, your AI business strategist. I'm here to help you discover how AI can transform your business operations and save you time.

Over the next few minutes, I'll ask you about your business, understand your challenges, and identify specific AI solutions that could help you grow. At the end, you'll receive a personalized report with practical recommendations and ROI estimates.

Let's start with getting to know your business. Tell me, what do you do and who are your customers?`;

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'business-context',
    text: ALEX_INTRODUCTION,
    helpText: 'This helps me understand your industry and core business model',
    category: 'business-overview'
  },
  {
    id: 'key-challenges',
    text: 'What are the biggest challenges or pain points your business is facing right now?',
    helpText: 'Think about operational, financial, or strategic challenges',
    category: 'challenges'
  },
  {
    id: 'growth-goals',
    text: 'What are your main goals for business growth in the next 6-12 months?',
    helpText: 'Consider revenue targets, market expansion, or operational improvements',
    category: 'goals'
  },
  {
    id: 'competitive-landscape',
    text: 'Who are your main competitors and what sets your business apart from them?',
    helpText: 'This helps identify your unique value proposition',
    category: 'competition'
  },
  {
    id: 'resource-constraints',
    text: 'What resources (time, budget, team) do you have available to tackle these challenges?',
    helpText: 'Understanding constraints helps prioritize recommendations',
    category: 'resources'
  }
];