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

export type AppConfig = {
  reminders: Reminder[];
  internetFavorites: string[];
  familyContacts: FamilyContact[];
  supportContactName: string;
  safetyMode: 'standard' | 'strict';
  requireAdminPin: boolean;
  adminPin: string;
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

export type AppConfigPatch = Partial<Omit<AppConfig, 'updatedAt' | 'allowedModules'>> & {
  allowedModules?: Partial<AppConfig['allowedModules']>;
};
