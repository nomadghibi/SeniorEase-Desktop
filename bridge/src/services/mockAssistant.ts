import type {
  AssistantExecutionResult,
  AssistantSessionSnapshot,
  AssistantSessionUpdate,
  AssistantAction,
  AssistantCommandRequest,
  AssistantCommandResponse,
  RiskLevel
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';

type AllowedModules = AppConfig['allowedModules'];

type Scenario = {
  matches: (input: string) => boolean;
  riskLevel: RiskLevel;
  message: string;
  actions: AssistantAction[];
};

const scenarios: Scenario[] = [
  {
    matches: (input) => input.includes('open my email') || input === 'open email',
    riskLevel: 'safe',
    message: 'I can open your Email screen now. Your newest messages will be shown in large text.',
    actions: [
      {
        id: 'open_email',
        label: 'Open Email',
        description: 'Go to your Email screen.'
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main SeniorEase screen.'
      }
    ]
  },
  {
    matches: (input) => input.includes('read this email') || input.includes('read email'),
    riskLevel: 'safe',
    message: 'I can read the selected email out loud and summarize it in simple language.',
    actions: [
      {
        id: 'read_aloud',
        label: 'Read Aloud',
        description: 'Play this email as audio.'
      },
      {
        id: 'summarize_email',
        label: 'Summarize Email',
        description: 'Show a shorter, easier summary.'
      }
    ]
  },
  {
    matches: (input) => input.includes('show my photos') || input.includes('open photos'),
    riskLevel: 'safe',
    message: 'I can open Photos and start from your recent family pictures.',
    actions: [
      {
        id: 'open_photos',
        label: 'Open Photos',
        description: 'See your recent photos.'
      },
      {
        id: 'start_slideshow',
        label: 'Start Slideshow',
        description: 'View photos one by one in full size.'
      }
    ]
  },
  {
    matches: (input) =>
      input.includes('open internet') ||
      input.includes('open browser') ||
      input.includes('open website'),
    riskLevel: 'safe',
    message: 'I can open Internet with trusted favorites and search in large text.',
    actions: [
      {
        id: 'open_internet',
        label: 'Open Internet',
        description: 'Go to the Internet screen.'
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ]
  },
  {
    matches: (input) => input.includes('open facebook') || input === 'facebook',
    riskLevel: 'safe',
    message: 'I can open Facebook with safety reminders and easy controls.',
    actions: [
      {
        id: 'open_facebook',
        label: 'Open Facebook',
        description: 'Go to the Facebook screen.'
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ]
  },
  {
    matches: (input) =>
      input.includes('open video call') ||
      input.includes('start a call') ||
      input.includes('video call'),
    riskLevel: 'safe',
    message: 'I can open Video Call so you can use your family shortcuts.',
    actions: [
      {
        id: 'open_videocall',
        label: 'Open Video Call',
        description: 'Go to the Video Call screen.'
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ]
  },
  {
    matches: (input) => input.includes('open family') || input.includes('family contacts'),
    riskLevel: 'safe',
    message: 'I can open Family contacts and quick actions now.',
    actions: [
      {
        id: 'open_family',
        label: 'Open Family',
        description: 'Go to the Family screen.'
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ]
  },
  {
    matches: (input) => input.includes('is this safe') || input.includes('safe?') || input.includes('scam'),
    riskLevel: 'caution',
    message:
      'This may need a safety check first. Do not click unknown links or attachments until we review together.',
    actions: [
      {
        id: 'scan_for_risk',
        label: 'Check Safety',
        description: 'Review common scam indicators.'
      },
      {
        id: 'contact_support',
        label: 'Call Support',
        description: 'Connect with a trusted support person.'
      }
    ]
  },
  {
    matches: (input) => input.includes('call support') || input.includes('help me now'),
    riskLevel: 'caution',
    message: 'Support can help right now. I can prepare a support request and keep this screen open.',
    actions: [
      {
        id: 'call_support',
        label: 'Call Support',
        description: 'Start a support call shortcut.'
      },
      {
        id: 'share_screen',
        label: 'Share Screen',
        description: 'Allow support to guide you live.',
        requiresConfirmation: true
      }
    ]
  },
  {
    matches: (input) =>
      input.includes('send money') ||
      input.includes('install this app') ||
      input.includes('give password') ||
      input.includes('wire transfer'),
    riskLevel: 'blocked',
    message:
      'This action is blocked for safety. I can connect you to support before any sensitive action is taken.',
    actions: [
      {
        id: 'blocked_contact_support',
        label: 'Contact Support',
        description: 'Ask a trusted person to review this request.'
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to your main screen.'
      }
    ]
  }
];

const actionModuleMap: Record<string, keyof AllowedModules> = {
  open_email: 'email',
  read_aloud: 'email',
  summarize_email: 'email',
  open_internet: 'internet',
  open_facebook: 'facebook',
  open_videocall: 'videocall',
  open_family: 'family',
  open_photos: 'photos',
  show_photos: 'photos',
  start_slideshow: 'photos'
};

const normalizeText = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getSupportCallLabel = (supportContactName: string): string => {
  const trimmed = supportContactName.trim();
  return trimmed.length > 0 ? `Call ${trimmed}` : 'Call Support';
};

const callSupportAction = (supportContactName: string): AssistantAction => {
  return {
    id: 'call_support',
    label: getSupportCallLabel(supportContactName),
    description: 'Connect with a trusted support person.'
  };
};

const fallbackResponse = (supportContactName: string): AssistantCommandResponse => {
  return {
    success: true,
    riskLevel: 'safe',
    message:
      'I can help with that. Try one of the quick actions below, or ask in simple words like "Open my email".',
    actions: [
      {
        id: 'open_email',
        label: 'Open My Email',
        description: 'Go to your inbox with large controls.'
      },
      {
        id: 'show_photos',
        label: 'Show My Photos',
        description: 'Open your recent photo view.'
      },
      {
        id: 'call_support',
        label: getSupportCallLabel(supportContactName),
        description: 'Connect with a trusted support person.'
      }
    ]
  };
};

const moduleDisabledResponse = (supportContactName: string): AssistantCommandResponse => {
  return {
    success: true,
    riskLevel: 'blocked',
    message:
      'That section is currently turned off by support settings. You can ask support to enable it.',
    actions: [
      callSupportAction(supportContactName),
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to your main screen.'
      }
    ]
  };
};

const limitedActionsResponse = (supportContactName: string): AssistantCommandResponse => {
  return {
    success: true,
    riskLevel: 'caution',
    message:
      'Available actions are limited by current support settings. You can go home or call support.',
    actions: [
      callSupportAction(supportContactName),
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ]
  };
};

const normalizeHostKey = (url: string): string => {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, '');
    const parts = host.split('.');
    const withoutTld = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
    return normalizeText(withoutTld);
  } catch {
    return '';
  }
};

const findFavoriteFromInput = (
  normalizedInput: string,
  favorites: AppConfig['internetFavorites']
): AppConfig['internetFavorites'][number] | null => {
  for (const favorite of favorites) {
    const labelKey = normalizeText(favorite.label);
    const hostKey = normalizeHostKey(favorite.url);

    if (labelKey && normalizedInput.includes(labelKey)) {
      return favorite;
    }

    if (hostKey && normalizedInput.includes(hostKey)) {
      return favorite;
    }
  }

  return null;
};

const findFamilyContactFromTarget = (
  normalizedTarget: string,
  contacts: AppConfig['familyContacts']
): AppConfig['familyContacts'][number] | null => {
  for (const contact of contacts) {
    const nameKey = normalizeText(contact.name);
    const relationKey = normalizeText(contact.relation);
    const isNameMatch =
      nameKey.length > 0 &&
      (nameKey === normalizedTarget ||
        nameKey.includes(normalizedTarget) ||
        normalizedTarget.includes(nameKey));
    const isRelationMatch =
      relationKey.length > 0 &&
      (relationKey === normalizedTarget ||
        relationKey.includes(normalizedTarget) ||
        normalizedTarget.includes(relationKey));

    if (isNameMatch || isRelationMatch) {
      return contact;
    }
  }

  return null;
};

const extractCallTarget = (normalizedInput: string): string | null => {
  const match = normalizedInput.match(/\bcall\s+(.+)$/i);

  if (!match) {
    return null;
  }

  const cleaned = match[1]
    .replace(/\b(please|now|right now|for me)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > 0 ? cleaned : null;
};

const buildPrinterHelpResponse = (
  normalizedInput: string,
  supportContactName: string
): AssistantCommandResponse | null => {
  if (!normalizedInput.includes('printer')) {
    return null;
  }

  return {
    success: true,
    riskLevel: 'caution',
    message:
      'I can help with printer issues. The safest next step is to contact support for guided troubleshooting.',
    actions: [
      callSupportAction(supportContactName),
      {
        id: 'share_screen',
        label: 'Share Screen',
        description: 'Let support guide you live.',
        requiresConfirmation: true
      }
    ]
  };
};

const buildCallByNameResponse = (
  normalizedInput: string,
  config: AppConfig
): AssistantCommandResponse | null => {
  const target = extractCallTarget(normalizedInput);

  if (!target) {
    return null;
  }

  const supportName = normalizeText(config.supportContactName);
  const isSupportTarget =
    target.includes('support') ||
    (supportName.length > 0 &&
      (target === supportName ||
        target.includes(supportName) ||
        supportName.includes(target)));

  if (isSupportTarget) {
    return {
      success: true,
      riskLevel: 'caution',
      message:
        'I can contact your support person now and prepare a request with details from this screen.',
      actions: [
        callSupportAction(config.supportContactName),
        {
          id: 'share_screen',
          label: 'Share Screen',
          description: 'Let support guide you live.',
          requiresConfirmation: true
        }
      ]
    };
  }

  const contact = findFamilyContactFromTarget(target, config.familyContacts);

  if (!contact) {
    return null;
  }

  if (!config.allowedModules.videocall) {
    return moduleDisabledResponse(config.supportContactName);
  }

  const actions: AssistantAction[] = [
    {
      id: 'open_videocall',
      label: 'Open Video Call',
      description: `Open Video Call to contact ${contact.name}.`
    },
    {
      id: 'go_home',
      label: 'Go Home',
      description: 'Return to the main screen.'
    }
  ];

  if (config.allowedModules.family) {
    actions.splice(1, 0, {
      id: 'open_family',
      label: 'Open Family',
      description: `Review family options for ${contact.name}.`
    });
  }

  return {
    success: true,
    riskLevel: 'safe',
    message: `I can help you call ${contact.name}. I will open your Video Call screen.`,
    actions
  };
};

const buildWebsiteShortcutResponse = (
  normalizedInput: string,
  config: AppConfig
): AssistantCommandResponse | null => {
  const asksForWebsite =
    normalizedInput.includes('website') ||
    normalizedInput.includes('site') ||
    normalizedInput.includes('take me to') ||
    normalizedInput.includes('go to my');

  if (!asksForWebsite) {
    return null;
  }

  const favorite = findFavoriteFromInput(normalizedInput, config.internetFavorites);

  if (!favorite) {
    return null;
  }

  const blockUntrustedFavorite =
    config.safetyMode === 'strict' || config.webGuardrails.untrustedFavorite === 'block';

  if (!favorite.trusted && blockUntrustedFavorite) {
    return {
      success: true,
      riskLevel: 'blocked',
      message: `${favorite.label} is not marked trusted, so I paused this action for safety.`,
      actions: [
        callSupportAction(config.supportContactName),
        {
          id: 'go_home',
          label: 'Go Home',
          description: 'Return to the main screen.'
        }
      ]
    };
  }

  return {
    success: true,
    riskLevel: favorite.trusted ? 'safe' : 'caution',
    message: favorite.trusted
      ? `I found ${favorite.label}. I can open Internet so you can visit it now.`
      : `${favorite.label} is not marked trusted. I can still open Internet so you can decide carefully.`,
    actions: [
      {
        id: 'open_internet',
        label: 'Open Internet',
        description: `Open Internet and then select ${favorite.label}.`
      },
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to the main screen.'
      }
    ]
  };
};

const detectRequestedModule = (
  input: string
): keyof AllowedModules | null => {
  if (input.includes('support') || input.includes('help me')) {
    return null;
  }

  if (input.includes('email')) {
    return 'email';
  }

  if (input.includes('photo') || input.includes('pictures')) {
    return 'photos';
  }

  if (input.includes('facebook')) {
    return 'facebook';
  }

  if (input.includes('internet') || input.includes('website') || input.includes('browser')) {
    return 'internet';
  }

  if (input.includes('video call') || input.includes('zoom') || input.includes('meet') || input.includes('teams')) {
    return 'videocall';
  }

  if (input.includes('family')) {
    return 'family';
  }

  return null;
};

const followUpCommandSet = new Set([
  'open it',
  'do it',
  'continue',
  'go ahead',
  'yes',
  'yes please',
  'ok',
  'okay'
]);

const buildContinuationResponse = (
  actionId: string,
  session: AssistantSessionSnapshot | null,
  config: AppConfig
): AssistantCommandResponse | null => {
  const contactName = session?.lastContactName?.trim();
  const supportAction = callSupportAction(config.supportContactName);

  switch (actionId) {
    case 'open_email':
      return {
        success: true,
        riskLevel: 'safe',
        message: 'Continuing your last step. I can open Email now.',
        actions: [
          {
            id: 'open_email',
            label: 'Open Email',
            description: 'Go to your Email screen.'
          },
          {
            id: 'go_home',
            label: 'Go Home',
            description: 'Return to the main screen.'
          }
        ]
      };
    case 'open_photos':
    case 'show_photos':
    case 'start_slideshow':
      return {
        success: true,
        riskLevel: 'safe',
        message: 'Continuing your last step. I can open Photos now.',
        actions: [
          {
            id: 'open_photos',
            label: 'Open Photos',
            description: 'Go to your Photos screen.'
          },
          {
            id: 'start_slideshow',
            label: 'Start Slideshow',
            description: 'Play photos one by one in full size.'
          }
        ]
      };
    case 'open_internet':
      return {
        success: true,
        riskLevel: 'safe',
        message: 'Continuing your last step. I can open Internet now.',
        actions: [
          {
            id: 'open_internet',
            label: 'Open Internet',
            description: 'Go to the Internet screen.'
          },
          {
            id: 'go_home',
            label: 'Go Home',
            description: 'Return to the main screen.'
          }
        ]
      };
    case 'open_facebook':
      return {
        success: true,
        riskLevel: 'safe',
        message: 'Continuing your last step. I can open Facebook now.',
        actions: [
          {
            id: 'open_facebook',
            label: 'Open Facebook',
            description: 'Go to the Facebook screen.'
          },
          {
            id: 'go_home',
            label: 'Go Home',
            description: 'Return to the main screen.'
          }
        ]
      };
    case 'open_family':
      return {
        success: true,
        riskLevel: 'safe',
        message: 'Continuing your last step. I can open Family now.',
        actions: [
          {
            id: 'open_family',
            label: 'Open Family',
            description: 'Go to your Family screen.'
          },
          {
            id: 'go_home',
            label: 'Go Home',
            description: 'Return to the main screen.'
          }
        ]
      };
    case 'open_videocall':
      return {
        success: true,
        riskLevel: 'safe',
        message: contactName
          ? `Continuing your last step. I can open Video Call for ${contactName}.`
          : 'Continuing your last step. I can open Video Call now.',
        actions: [
          {
            id: 'open_videocall',
            label: 'Open Video Call',
            description: contactName
              ? `Go to Video Call and contact ${contactName}.`
              : 'Go to your Video Call screen.'
          },
          {
            id: 'go_home',
            label: 'Go Home',
            description: 'Return to the main screen.'
          }
        ]
      };
    case 'call_support':
    case 'contact_support':
    case 'blocked_contact_support':
      return {
        success: true,
        riskLevel: 'caution',
        message: 'Continuing your last step. I can contact support now.',
        actions: [
          supportAction,
          {
            id: 'share_screen',
            label: 'Share Screen',
            description: 'Let support guide you live.',
            requiresConfirmation: true
          }
        ]
      };
    default:
      return null;
  }
};

const buildSessionFollowUpResponse = (
  normalizedInput: string,
  session: AssistantSessionSnapshot | null,
  config: AppConfig
): AssistantCommandResponse | null => {
  if (!session) {
    return null;
  }

  const asksSafetyCheck = normalizedInput.includes('is this safe') || normalizedInput.includes('safe?');

  if (asksSafetyCheck && session.lastIntent === 'website' && session.lastFavoriteLabel) {
    return {
      success: true,
      riskLevel: 'caution',
      message: `${session.lastFavoriteLabel} should be checked first. Avoid entering personal details unless support confirms it is safe.`,
      actions: [
        {
          id: 'scan_for_risk',
          label: 'Check Safety',
          description: 'Review common scam warning signs.'
        },
        callSupportAction(config.supportContactName)
      ]
    };
  }

  if (
    (normalizedInput.includes('call him') ||
      normalizedInput.includes('call her') ||
      normalizedInput.includes('call them')) &&
    session.lastContactName
  ) {
    return buildCallByNameResponse(normalizeText(`call ${session.lastContactName}`), config);
  }

  if (followUpCommandSet.has(normalizedInput) && session.lastActionId) {
    return buildContinuationResponse(session.lastActionId, session, config);
  }

  return null;
};

const applyPolicyAndFilter = (
  initialResponse: AssistantCommandResponse,
  config: Pick<AppConfig, 'safetyMode' | 'allowedModules' | 'supportContactName'>
): AssistantCommandResponse => {
  const response: AssistantCommandResponse = {
    ...initialResponse,
    actions: [...initialResponse.actions]
  };

  if (config.safetyMode === 'strict' && response.riskLevel === 'caution') {
    response.riskLevel = 'blocked';
    response.message =
      'Strict safety mode is on. This action is paused until a trusted support person reviews it.';
    response.actions = [
      callSupportAction(config.supportContactName),
      {
        id: 'go_home',
        label: 'Go Home',
        description: 'Return to your safe home screen.'
      }
    ];
  }

  const filteredActions = response.actions.filter((action) => {
    const module = actionModuleMap[action.id];

    if (!module) {
      return true;
    }

    return config.allowedModules[module];
  });

  if (filteredActions.length === 0) {
    return limitedActionsResponse(config.supportContactName);
  }

  return {
    ...response,
    actions: filteredActions
  };
};

const inferSessionUpdate = (
  normalizedInput: string,
  response: AssistantCommandResponse,
  config: AppConfig,
  session: AssistantSessionSnapshot | null
): AssistantSessionUpdate => {
  const primaryActionId = response.actions[0]?.id ?? session?.lastActionId;
  const update: AssistantSessionUpdate = {};

  if (!primaryActionId) {
    return update;
  }

  update.lastActionId = primaryActionId;

  if (
    primaryActionId === 'call_support' ||
    primaryActionId === 'contact_support' ||
    primaryActionId === 'blocked_contact_support' ||
    primaryActionId === 'share_screen'
  ) {
    update.lastIntent = 'support';
    return update;
  }

  if (primaryActionId === 'open_internet') {
    update.lastIntent = 'website';
    const favorite = findFavoriteFromInput(normalizedInput, config.internetFavorites);
    update.lastFavoriteLabel = favorite?.label ?? session?.lastFavoriteLabel;
    return update;
  }

  if (primaryActionId === 'open_videocall') {
    update.lastIntent = 'call';
    const target = extractCallTarget(normalizedInput);
    const contact =
      target !== null ? findFamilyContactFromTarget(target, config.familyContacts) : null;
    update.lastContactName = contact?.name ?? session?.lastContactName;
    return update;
  }

  if (
    primaryActionId.startsWith('open_') ||
    primaryActionId === 'show_photos' ||
    primaryActionId === 'start_slideshow' ||
    primaryActionId === 'read_aloud' ||
    primaryActionId === 'summarize_email'
  ) {
    update.lastIntent = 'module';
    return update;
  }

  update.lastIntent = 'unknown';
  return update;
};

export const runMockAssistant = (
  request: AssistantCommandRequest,
  config: AppConfig,
  session: AssistantSessionSnapshot | null = null
): AssistantExecutionResult => {
  const normalized = normalizeText(request.command);
  const finalize = (raw: AssistantCommandResponse): AssistantExecutionResult => {
    const response = applyPolicyAndFilter(raw, config);
    const sessionUpdate = inferSessionUpdate(normalized, response, config, session);
    return {
      response,
      sessionUpdate
    };
  };

  const followUpResponse = buildSessionFollowUpResponse(normalized, session, config);

  if (followUpResponse) {
    return finalize(followUpResponse);
  }

  const requestedModule = detectRequestedModule(normalized);

  if (requestedModule && !config.allowedModules[requestedModule]) {
    return finalize(moduleDisabledResponse(config.supportContactName));
  }

  const printerResponse = buildPrinterHelpResponse(normalized, config.supportContactName);

  if (printerResponse) {
    return finalize(printerResponse);
  }

  const callByNameResponse = buildCallByNameResponse(normalized, config);

  if (callByNameResponse) {
    return finalize(callByNameResponse);
  }

  const websiteShortcutResponse = buildWebsiteShortcutResponse(normalized, config);

  if (websiteShortcutResponse) {
    return finalize(websiteShortcutResponse);
  }

  const scenario = scenarios.find((candidate) => candidate.matches(normalized));
  const response = scenario
    ? {
        success: true as const,
        message: scenario.message,
        riskLevel: scenario.riskLevel,
        actions: scenario.actions
      }
    : fallbackResponse(config.supportContactName);

  return finalize(response);
};
