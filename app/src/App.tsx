import { useEffect } from 'react';
import AppShell from '@/components/AppShell';
import type { ScreenId } from '@/lib/modules';
import SettingsLockScreen from '@/screens/SettingsLockScreen';
import { useConfigStore } from '@/store/configStore';
import { useAdminStore } from '@/store/adminStore';
import { useUiStore } from '@/store/uiStore';
import EmailScreen from '@/screens/EmailScreen';
import FacebookScreen from '@/screens/FacebookScreen';
import FamilyScreen from '@/screens/FamilyScreen';
import HelpScreen from '@/screens/HelpScreen';
import HomeScreen from '@/screens/HomeScreen';
import InternetScreen from '@/screens/InternetScreen';
import PhotosScreen from '@/screens/PhotosScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import VideoCallScreen from '@/screens/VideoCallScreen';

const SCREEN_COMPONENTS: Record<ScreenId, JSX.Element> = {
  home: <HomeScreen />,
  email: <EmailScreen />,
  photos: <PhotosScreen />,
  internet: <InternetScreen />,
  facebook: <FacebookScreen />,
  videocall: <VideoCallScreen />,
  family: <FamilyScreen />,
  help: <HelpScreen />,
  settings: <SettingsScreen />
};

const App = () => {
  const currentScreen = useUiStore((state) => state.currentScreen);
  const goHome = useUiStore((state) => state.goHome);
  const loadConfig = useConfigStore((state) => state.loadConfig);
  const allowedModules = useConfigStore((state) => state.config.allowedModules);
  const requireAdminPin = useConfigStore((state) => state.config.requireAdminPin);
  const isSettingsUnlocked = useAdminStore((state) => state.isSettingsUnlocked);
  const lockSettings = useAdminStore((state) => state.lockSettings);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (currentScreen === 'home') {
      lockSettings();
      return;
    }

    if (currentScreen === 'settings') {
      return;
    }

    if (!allowedModules[currentScreen]) {
      goHome();
    }
  }, [allowedModules, currentScreen, goHome, lockSettings]);

  if (currentScreen === 'settings' && requireAdminPin && !isSettingsUnlocked) {
    return (
      <AppShell>
        <SettingsLockScreen />
      </AppShell>
    );
  }

  return <AppShell>{SCREEN_COMPONENTS[currentScreen]}</AppShell>;
};

export default App;
