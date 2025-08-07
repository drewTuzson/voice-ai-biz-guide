export interface AssessmentQuestion {
  id: string;
  text: string;
  helpText?: string;
  category: string;
}

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'business-context',
    text: 'Tell me about your business. What do you do, and who are your customers?',
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