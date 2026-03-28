import ModulePlaceholder from '@/components/ModulePlaceholder';

const VideoCallScreen = () => {
  return (
    <ModulePlaceholder
      title="Video Call"
      subtitle="Start a call with family or open your meeting links quickly."
      quickActions={[
        { label: 'Call Anna', helper: 'Start your saved call shortcut.' },
        { label: 'Call Michael', helper: 'Connect in one tap.' },
        { label: 'Open Zoom', helper: 'Launch Zoom with large controls.' },
        { label: 'Open Meeting Link', helper: 'Join your saved appointment links.' }
      ]}
    />
  );
};

export default VideoCallScreen;
