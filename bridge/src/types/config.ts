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

export const websiteFavoriteSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  url: z.string().url(),
  trusted: z.boolean()
});

export const moduleVisibilitySchema = z.object({
  email: z.boolean(),
  photos: z.boolean(),
  internet: z.boolean(),
  facebook: z.boolean(),
  videocall: z.boolean(),
  family: z.boolean(),
  help: z.boolean(),
  settings: z.boolean()
});

export const appConfigSchema = z.object({
  reminders: z.array(reminderSchema),
  internetFavorites: z.array(websiteFavoriteSchema),
  familyContacts: z.array(familyContactSchema),
  supportContactName: z.string().min(1),
  safetyMode: z.enum(['standard', 'strict']),
  requireAdminPin: z.boolean(),
  adminPin: z.string().regex(/^\d{4,8}$/),
  allowedModules: moduleVisibilitySchema,
  updatedAt: z.string().min(1)
});

export const appConfigPatchSchema = z
  .object({
    reminders: z.array(reminderSchema).optional(),
    internetFavorites: z.array(websiteFavoriteSchema).optional(),
    familyContacts: z.array(familyContactSchema).optional(),
    supportContactName: z.string().min(1).optional(),
    safetyMode: z.enum(['standard', 'strict']).optional(),
    requireAdminPin: z.boolean().optional(),
    adminPin: z.string().regex(/^\d{4,8}$/).optional(),
    allowedModules: moduleVisibilitySchema.partial().optional()
  })
  .strict();

export type AppConfig = z.infer<typeof appConfigSchema>;
export type AppConfigPatch = z.infer<typeof appConfigPatchSchema>;
