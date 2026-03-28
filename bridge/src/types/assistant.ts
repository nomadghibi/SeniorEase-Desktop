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

export type AssistantIntent =
  | 'website'
  | 'call'
  | 'support'
  | 'module'
  | 'unknown';

export type AssistantSessionSnapshot = {
  lastCommand: string;
  lastRiskLevel: RiskLevel;
  lastActionId?: string;
  lastIntent?: AssistantIntent;
  lastContactName?: string;
  lastFavoriteLabel?: string;
  updatedAt: string;
};

export type AssistantSessionUpdate = Partial<
  Omit<AssistantSessionSnapshot, 'lastCommand' | 'lastRiskLevel' | 'updatedAt'>
> & {
  lastIntent?: AssistantIntent;
};

export type AssistantExecutionResult = {
  response: AssistantCommandResponse;
  sessionUpdate?: AssistantSessionUpdate;
};
