import ModulePlaceholder from '@/components/ModulePlaceholder';

const FacebookScreen = () => {
  return (
    <ModulePlaceholder
      title="Facebook"
      subtitle="Open Facebook with easy return and support options."
      safetyMessage="If someone asks for gift cards, money transfers, or private details, stop and ask for help."
      quickActions={[
        { label: 'Open Facebook', helper: 'Go directly to your Facebook home page.' },
        { label: 'See Family Posts', helper: 'Find updates from people you know.' },
        { label: 'Open Messages', helper: 'Check private messages in one tap.' },
        { label: 'Report Something Suspicious', helper: 'Get help if a post feels unsafe.' }
      ]}
    />
  );
};

export default FacebookScreen;
