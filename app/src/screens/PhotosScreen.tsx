import { useEffect, useMemo, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { useConfigStore } from '@/store/configStore';

type PhotoAlbum = 'recent' | 'family' | 'events';

type PhotoItem = {
  id: string;
  title: string;
  album: PhotoAlbum;
  takenAt: string;
  colors: [string, string];
};

const mockPhotos: PhotoItem[] = [
  {
    id: 'photo-1',
    title: 'Anna Birthday Cake',
    album: 'family',
    takenAt: '2026-03-20',
    colors: ['#f9d8c0', '#f4a261']
  },
  {
    id: 'photo-2',
    title: 'Sunday Park Walk',
    album: 'recent',
    takenAt: '2026-03-24',
    colors: ['#d9f0d3', '#7fb069']
  },
  {
    id: 'photo-3',
    title: 'Family Dinner',
    album: 'family',
    takenAt: '2026-03-18',
    colors: ['#fee6a8', '#f4b942']
  },
  {
    id: 'photo-4',
    title: 'Church Picnic',
    album: 'events',
    takenAt: '2026-03-08',
    colors: ['#d7ecff', '#5aa9e6']
  },
  {
    id: 'photo-5',
    title: 'Garden Flowers',
    album: 'recent',
    takenAt: '2026-03-26',
    colors: ['#f3d8ff', '#c77dff']
  },
  {
    id: 'photo-6',
    title: 'Holiday Lights',
    album: 'events',
    takenAt: '2026-03-02',
    colors: ['#ffd6e0', '#f071a0']
  }
];

const albumLabels: Record<PhotoAlbum, string> = {
  recent: 'Recent Photos',
  family: 'Family Album',
  events: 'Events Album'
};

const sortNewestFirst = (photos: PhotoItem[]): PhotoItem[] => {
  return [...photos].sort((a, b) => (a.takenAt < b.takenAt ? 1 : -1));
};

const PhotosScreen = () => {
  const contacts = useConfigStore((state) => state.config.familyContacts);

  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum>('recent');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(mockPhotos[0]?.id ?? '');
  const [isSlideshowMode, setIsSlideshowMode] = useState(false);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recentPhotos = useMemo(
    () => sortNewestFirst(mockPhotos).slice(0, 4),
    []
  );

  const visiblePhotos = useMemo(() => {
    if (selectedAlbum === 'recent') {
      return recentPhotos;
    }

    return sortNewestFirst(mockPhotos.filter((photo) => photo.album === selectedAlbum));
  }, [recentPhotos, selectedAlbum]);

  const selectedPhoto = useMemo(() => {
    return mockPhotos.find((photo) => photo.id === selectedPhotoId) ?? null;
  }, [selectedPhotoId]);

  const slideshowPhotos = useMemo(() => {
    return sortNewestFirst(mockPhotos);
  }, []);

  const currentSlideIndex = useMemo(() => {
    return Math.max(
      0,
      slideshowPhotos.findIndex((photo) => photo.id === selectedPhotoId)
    );
  }, [selectedPhotoId, slideshowPhotos]);

  useEffect(() => {
    if (!selectedPhotoId && visiblePhotos.length > 0) {
      setSelectedPhotoId(visiblePhotos[0].id);
    }
  }, [selectedPhotoId, visiblePhotos]);

  useEffect(() => {
    if (!isSlideshowMode || !isSlideshowPlaying || slideshowPhotos.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      const nextIndex = (currentSlideIndex + 1) % slideshowPhotos.length;
      setSelectedPhotoId(slideshowPhotos[nextIndex].id);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [currentSlideIndex, isSlideshowMode, isSlideshowPlaying, slideshowPhotos]);

  const startSlideshow = () => {
    setIsSlideshowMode(true);
    setIsSlideshowPlaying(true);
    if (!selectedPhotoId && slideshowPhotos.length > 0) {
      setSelectedPhotoId(slideshowPhotos[0].id);
    }
    setStatusMessage('Slideshow started.');
  };

  const stopSlideshow = () => {
    setIsSlideshowPlaying(false);
    setIsSlideshowMode(false);
    setStatusMessage('Slideshow stopped.');
  };

  const moveSlide = (direction: 'next' | 'prev') => {
    if (slideshowPhotos.length === 0) {
      return;
    }

    const offset = direction === 'next' ? 1 : -1;
    const nextIndex = (currentSlideIndex + offset + slideshowPhotos.length) % slideshowPhotos.length;
    setSelectedPhotoId(slideshowPhotos[nextIndex].id);
  };

  const sharePhoto = (contactId: string) => {
    const contact = contacts.find((entry) => entry.id === contactId);

    if (!selectedPhoto || !contact) {
      return;
    }

    const approved = window.confirm(`Share "${selectedPhoto.title}" with ${contact.name}?`);

    if (!approved) {
      return;
    }

    setStatusMessage(`Shared "${selectedPhoto.title}" with ${contact.name}.`);
  };

  return (
    <section>
      <ScreenHeader
        title="Photos"
        subtitle="View recent memories, start a slideshow, and share photos with family."
      />

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-[#9ac6a4] bg-[#dff2e5] p-4 text-lg text-[#174128] sm:text-xl">
          {statusMessage}
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(Object.keys(albumLabels) as PhotoAlbum[]).map((album) => (
          <button
            key={album}
            type="button"
            onClick={() => {
              setSelectedAlbum(album);
              setIsSlideshowMode(false);
              setIsSlideshowPlaying(false);
            }}
            className={`rounded-2xl border-2 px-4 py-3 text-xl font-semibold ${
              selectedAlbum === album
                ? 'border-[#2d5d42] bg-[#eef8f0] text-[#174128]'
                : 'border-[var(--line-soft)] bg-white text-[var(--text-strong)]'
            }`}
          >
            {albumLabels[album]}
          </button>
        ))}
      </div>

      {isSlideshowMode ? (
        <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
              Slideshow
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveSlide('prev')}
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-2 text-lg font-semibold text-[var(--text-strong)]"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setIsSlideshowPlaying((current) => !current)}
                className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-2 text-lg font-semibold text-white"
              >
                {isSlideshowPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => moveSlide('next')}
                className="rounded-xl border-2 border-[var(--line-soft)] bg-white px-4 py-2 text-lg font-semibold text-[var(--text-strong)]"
              >
                Next
              </button>
              <button
                type="button"
                onClick={stopSlideshow}
                className="rounded-xl border-2 border-[#a44343] bg-[#a44343] px-4 py-2 text-lg font-semibold text-white"
              >
                Exit Slideshow
              </button>
            </div>
          </div>

          {selectedPhoto ? (
            <div className="rounded-3xl border border-[var(--line-soft)] bg-white p-5">
              <div
                className="mb-4 h-72 rounded-2xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${selectedPhoto.colors[0]}, ${selectedPhoto.colors[1]})`
                }}
              />
              <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
                {selectedPhoto.title}
              </p>
              <p className="mt-1 text-lg text-[var(--text-muted)] sm:text-xl">
                Taken on {selectedPhoto.takenAt}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
              {albumLabels[selectedAlbum]}
            </h2>
            <button
              type="button"
              onClick={startSlideshow}
              className="rounded-xl border-2 border-[#2d5d42] bg-[#2d5d42] px-4 py-2 text-lg font-semibold text-white"
            >
              Start Slideshow
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhotoId(photo.id)}
                className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                  photo.id === selectedPhotoId
                    ? 'border-[#2d5d42] bg-[#eef8f0]'
                    : 'border-[var(--line-soft)] bg-white'
                }`}
              >
                <div
                  className="mb-3 h-36 rounded-xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${photo.colors[0]}, ${photo.colors[1]})`
                  }}
                />
                <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">{photo.title}</p>
                <p className="mt-1 text-lg text-[var(--text-muted)]">{photo.takenAt}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 sm:p-8">
        <h2 className="mb-4 font-[var(--font-display)] text-3xl text-[var(--text-strong)] sm:text-4xl">
          Share Selected Photo
        </h2>

        {!selectedPhoto ? (
          <p className="text-xl text-[var(--text-muted)] sm:text-2xl">Select a photo first.</p>
        ) : (
          <>
            <p className="mb-4 text-xl text-[var(--text-muted)] sm:text-2xl">
              Selected: <strong className="text-[var(--text-strong)]">{selectedPhoto.title}</strong>
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {contacts.length === 0 ? (
                <p className="rounded-2xl border border-[var(--line-soft)] bg-white p-4 text-xl text-[var(--text-muted)] md:col-span-2 xl:col-span-3">
                  No family contacts configured yet.
                </p>
              ) : null}
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => sharePhoto(contact.id)}
                  className="rounded-2xl border-2 border-[var(--line-soft)] bg-white px-4 py-4 text-left transition-colors hover:border-[var(--line-strong)]"
                >
                  <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">{contact.name}</p>
                  <p className="mt-1 text-lg text-[var(--text-muted)] sm:text-xl">{contact.relation}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PhotosScreen;
