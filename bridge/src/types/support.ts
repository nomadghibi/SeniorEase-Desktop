import { z } from 'zod';

export const supportRequestSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  reason: z.string().min(1),
  screen: z.string().optional(),
  riskLevel: z.enum(['safe', 'caution', 'blocked']).optional()
});

export const supportLogEntrySchema = supportRequestSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  status: z.enum(['open', 'closed'])
});

export type SupportRequest = z.infer<typeof supportRequestSchema>;
export type SupportLogEntry = z.infer<typeof supportLogEntrySchema>;
