import {
  Globe2,
  HandHelping,
  Images,
  Mail,
  MessageCircleHeart,
  UsersRound,
  Video
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ScreenId =
  | 'home'
  | 'email'
  | 'photos'
  | 'internet'
  | 'facebook'
  | 'videocall'
  | 'family'
  | 'help';

type ModuleTone = {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
};

export type HomeModule = {
  id: Exclude<ScreenId, 'home'>;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  tone: ModuleTone;
};

export const HOME_MODULES: HomeModule[] = [
  {
    id: 'email',
    label: 'Email',
    subtitle: 'Read and reply with clear steps',
    icon: Mail,
    tone: {
      bg: '#f6fbf5',
      border: '#bdd5c2',
      iconBg: '#2d5d42',
      iconColor: '#f7fbf7'
    }
  },
  {
    id: 'photos',
    label: 'Photos',
    subtitle: 'See recent family memories',
    icon: Images,
    tone: {
      bg: '#f7faf0',
      border: '#d7dca8',
      iconBg: '#626d1d',
      iconColor: '#fdfef7'
    }
  },
  {
    id: 'internet',
    label: 'Internet',
    subtitle: 'Open trusted websites quickly',
    icon: Globe2,
    tone: {
      bg: '#f2f8fd',
      border: '#b9d5ea',
      iconBg: '#215b7d',
      iconColor: '#f6fbff'
    }
  },
  {
    id: 'facebook',
    label: 'Facebook',
    subtitle: 'Visit Facebook with easy controls',
    icon: MessageCircleHeart,
    tone: {
      bg: '#f5f4fc',
      border: '#cdc7eb',
      iconBg: '#3f3274',
      iconColor: '#f8f7ff'
    }
  },
  {
    id: 'videocall',
    label: 'Video Call',
    subtitle: 'Call family with one tap',
    icon: Video,
    tone: {
      bg: '#fdf6f1',
      border: '#eac6a9',
      iconBg: '#894216',
      iconColor: '#fff8f3'
    }
  },
  {
    id: 'family',
    label: 'Family',
    subtitle: 'Open family contacts and actions',
    icon: UsersRound,
    tone: {
      bg: '#f1f9f8',
      border: '#b5deda',
      iconBg: '#1e665f',
      iconColor: '#f4fcfb'
    }
  },
  {
    id: 'help',
    label: 'Help',
    subtitle: 'Get support at any time',
    icon: HandHelping,
    tone: {
      bg: '#fff8ef',
      border: '#f0d3a7',
      iconBg: '#8a5b18',
      iconColor: '#fffaf1'
    }
  }
];
