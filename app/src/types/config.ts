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
  updatedAt: string;
};

export type AppConfigPatch = Partial<
  Omit<AppConfig, 'updatedAt'>
>;
