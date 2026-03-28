import type { HomeModule } from '@/lib/modules';

type HomeTileProps = {
  module: HomeModule;
  onSelect: (screen: HomeModule['id']) => void;
};

const HomeTile = ({ module, onSelect }: HomeTileProps) => {
  const Icon = module.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(module.id)}
      className="group flex min-h-44 w-full items-center gap-5 rounded-3xl border-2 px-6 py-6 text-left shadow-tile transition-transform duration-150 hover:-translate-y-1"
      style={{
        backgroundColor: module.tone.bg,
        borderColor: module.tone.border
      }}
      aria-label={`Open ${module.label}`}
    >
      <span
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: module.tone.iconBg, color: module.tone.iconColor }}
      >
        <Icon size={34} strokeWidth={2.4} />
      </span>
      <span>
        <span className="block font-[var(--font-display)] text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl">
          {module.label}
        </span>
        <span className="mt-2 block text-lg leading-snug text-[var(--text-muted)] sm:text-xl">
          {module.subtitle}
        </span>
      </span>
    </button>
  );
};

export default HomeTile;
