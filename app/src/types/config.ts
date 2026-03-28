export type Reminder = {
  id: string;
  text: string;
  dueAt: string;
};

export type FamilyContact = {
  id: string;
  name: string;
  relation: string;
  email?: string;
  phone?: string;
};

export type WebsiteFavorite = {
  id: string;
  label: string;
  url: string;
  trusted: boolean;
};

export type WebGuardrails = {
  directWebsiteEntry: 'confirm' | 'block';
  untrustedFavorite: 'confirm' | 'block';
};

export type AppConfig = {
  reminders: Reminder[];
  internetFavorites: WebsiteFavorite[];
  familyContacts: FamilyContact[];
  supportContactName: string;
  safetyMode: 'standard' | 'strict';
  webGuardrails: WebGuardrails;
  requireAdminPin: boolean;
  adminPinConfigured: boolean;
  allowedModules: {
    email: boolean;
    photos: boolean;
    internet: boolean;
    facebook: boolean;
    videocall: boolean;
    family: boolean;
    help: boolean;
    settings: boolean;
  };
  updatedAt: string;
};

export type AppConfigPatch = Partial<
  Omit<AppConfig, 'updatedAt' | 'allowedModules' | 'adminPinConfigured' | 'webGuardrails'>
> & {
  adminPin?: string;
  allowedModules?: Partial<AppConfig['allowedModules']>;
  webGuardrails?: Partial<AppConfig['webGuardrails']>;
};
