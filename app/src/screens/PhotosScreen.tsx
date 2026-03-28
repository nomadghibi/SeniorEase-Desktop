import ModulePlaceholder from '@/components/ModulePlaceholder';

const PhotosScreen = () => {
  return (
    <ModulePlaceholder
      title="Photos"
      subtitle="Enjoy your pictures in a clear and simple view."
      quickActions={[
        { label: 'Recent Photos', helper: 'Open your newest pictures right away.' },
        { label: 'Family Albums', helper: 'Browse albums by person or event.' },
        { label: 'Start Slideshow', helper: 'View photos one by one in large format.' },
        { label: 'Share a Photo', helper: 'Pick a photo and send it with guided steps.' }
      ]}
    />
  );
};

export default PhotosScreen;
