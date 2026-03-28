export type RiskLevel = 'safe' | 'caution' | 'blocked';

export type AssistantAction = {
  id: string;
  label: string;
  description: string;
  requiresConfirmation?: boolean;
};

export type AssistantCommandContext = {
  screen?: string;
  selectedEmailId?: string;
};

export type AssistantCommandRequest = {
  userId: string;
  sessionId: string;
  command: string;
  context?: AssistantCommandContext;
};

export type AssistantCommandResponse = {
  success: true;
  message: string;
  actions: AssistantAction[];
  riskLevel: RiskLevel;
};
