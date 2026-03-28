import ModulePlaceholder from '@/components/ModulePlaceholder';

const EmailScreen = () => {
  return (
    <ModulePlaceholder
      title="Email"
      subtitle="Read, reply, and stay safe with clear steps."
      safetyMessage="If an email asks for money, passwords, or urgent action, ask for help before clicking any link."
      quickActions={[
        { label: 'Open Inbox', helper: 'See your newest messages in large text.' },
        { label: 'Read This Email', helper: 'Read the selected message out loud.' },
        { label: 'Reply to This Email', helper: 'Draft a friendly response and review before sending.' },
        { label: 'Delete or Archive', helper: 'Clean up with a confirmation step.' }
      ]}
    />
  );
};

export default EmailScreen;
