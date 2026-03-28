import type {
  AssistantAction,
  AssistantCommandRequest,
  AssistantCommandResponse,
  RiskLevel
} from '../types/assistant.js';
import type { AppConfig } from '../types/config.js';

type SafetyMode = 'standard' | 'strict';
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

const fallbackResponse: AssistantCommandResponse = {
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
    }
  ]
};

const actionModuleMap: Record<string, keyof AllowedModules> = {
  open_email: 'email',
  read_aloud: 'email',
  summarize_email: 'email',
  open_photos: 'photos',
  show_photos: 'photos',
  start_slideshow: 'photos'
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

export const runMockAssistant = (
  request: AssistantCommandRequest,
  safetyMode: SafetyMode,
  allowedModules: AllowedModules
): AssistantCommandResponse => {
  const normalized = request.command.trim().toLowerCase();
  const requestedModule = detectRequestedModule(normalized);

  if (requestedModule && !allowedModules[requestedModule]) {
    return {
      success: true,
      riskLevel: 'blocked',
      message:
        'That section is currently turned off by support settings. You can ask support to enable it.',
      actions: [
        {
          id: 'call_support',
          label: 'Call Support',
          description: 'Request access to this section.'
        },
        {
          id: 'go_home',
          label: 'Go Home',
          description: 'Return to your main screen.'
        }
      ]
    };
  }

  const scenario = scenarios.find((candidate) => candidate.matches(normalized));

  if (!scenario) {
    return fallbackResponse;
  }

  const response: AssistantCommandResponse = {
    success: true,
    message: scenario.message,
    riskLevel: scenario.riskLevel,
    actions: scenario.actions
  };

  if (safetyMode === 'strict' && response.riskLevel === 'caution') {
    response.riskLevel = 'blocked';
    response.message =
      'Strict safety mode is on. This action is paused until a trusted support person reviews it.';
    response.actions = [
      {
        id: 'call_support',
        label: 'Call Support',
        description: 'Ask a trusted support person to review this action.'
      },
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

    return allowedModules[module];
  });

  if (filteredActions.length === 0) {
    return {
      success: true,
      riskLevel: 'caution',
      message:
        'Available actions are limited by current support settings. You can go home or call support.',
      actions: [
        {
          id: 'call_support',
          label: 'Call Support',
          description: 'Ask support to review or enable this feature.'
        },
        {
          id: 'go_home',
          label: 'Go Home',
          description: 'Return to the main screen.'
        }
      ]
    };
  }

  return {
    ...response,
    actions: filteredActions
  };
};
