import { z } from 'zod';

export const reminderSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  dueAt: z.string().min(1)
});

export const familyContactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  relation: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

export const appConfigSchema = z.object({
  reminders: z.array(reminderSchema),
  internetFavorites: z.array(z.string().min(1)),
  familyContacts: z.array(familyContactSchema),
  supportContactName: z.string().min(1),
  safetyMode: z.enum(['standard', 'strict']),
  updatedAt: z.string().min(1)
});

export const appConfigPatchSchema = z
  .object({
    reminders: z.array(reminderSchema).optional(),
    internetFavorites: z.array(z.string().min(1)).optional(),
    familyContacts: z.array(familyContactSchema).optional(),
    supportContactName: z.string().min(1).optional(),
    safetyMode: z.enum(['standard', 'strict']).optional()
  })
  .strict();

export type AppConfig = z.infer<typeof appConfigSchema>;
export type AppConfigPatch = z.infer<typeof appConfigPatchSchema>;
