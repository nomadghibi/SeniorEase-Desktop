import type {
  AssistantAction,
  AssistantCommandRequest,
  AssistantCommandResponse,
  RiskLevel
} from '../types/assistant.js';

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

export const runMockAssistant = (
  request: AssistantCommandRequest
): AssistantCommandResponse => {
  const normalized = request.command.trim().toLowerCase();

  const scenario = scenarios.find((candidate) => candidate.matches(normalized));

  if (!scenario) {
    return fallbackResponse;
  }

  return {
    success: true,
    message: scenario.message,
    riskLevel: scenario.riskLevel,
    actions: scenario.actions
  };
};
