import type { RiskLevel } from '@/types/assistant';

export type SupportRequestPayload = {
  userId: string;
  sessionId: string;
  reason: string;
  screen?: string;
  riskLevel?: RiskLevel;
};

export type SupportRequestResponse = {
  success: true;
  ticketId: string;
  message: string;
  estimatedCallbackMinutes: number;
};

export type SupportLogEntry = {
  id: string;
  userId: string;
  sessionId: string;
  reason: string;
  screen?: string;
  riskLevel?: RiskLevel;
  createdAt: string;
  status: 'open' | 'closed';
};

export type SupportLogsResponse = {
  success: true;
  logs: SupportLogEntry[];
};

export type CloseSupportLogResponse = {
  success: true;
  log: SupportLogEntry;
};
