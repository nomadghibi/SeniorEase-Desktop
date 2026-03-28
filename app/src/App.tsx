import AppShell from '@/components/AppShell';
import type { ScreenId } from '@/lib/modules';
import { useUiStore } from '@/store/uiStore';
import EmailScreen from '@/screens/EmailScreen';
import FacebookScreen from '@/screens/FacebookScreen';
import FamilyScreen from '@/screens/FamilyScreen';
import HelpScreen from '@/screens/HelpScreen';
import HomeScreen from '@/screens/HomeScreen';
import InternetScreen from '@/screens/InternetScreen';
import PhotosScreen from '@/screens/PhotosScreen';
import VideoCallScreen from '@/screens/VideoCallScreen';

const SCREEN_COMPONENTS: Record<ScreenId, JSX.Element> = {
  home: <HomeScreen />,
  email: <EmailScreen />,
  photos: <PhotosScreen />,
  internet: <InternetScreen />,
  facebook: <FacebookScreen />,
  videocall: <VideoCallScreen />,
  family: <FamilyScreen />,
  help: <HelpScreen />
};

const App = () => {
  const currentScreen = useUiStore((state) => state.currentScreen);

  return <AppShell>{SCREEN_COMPONENTS[currentScreen]}</AppShell>;
};

export default App;
