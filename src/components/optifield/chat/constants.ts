
export const INITIAL_MESSAGES = [
  {
    id: '1',
    content: 'Bonjour! Je suis Claude, votre assistant OptiField propulsé par Anthropic. Comment puis-je vous aider aujourd\'hui?',
    sender: 'user' as const,
    timestamp: new Date(Date.now() - 60000)
  }
];

export const QUICK_REPLIES = [
  "Démarrer le labour avec le John Deere",
  "Combien d'heures a fait le tracteur aujourd'hui?",
  "Pause déjeuner",
  "Quelle est la météo pour cet après-midi?"
];
