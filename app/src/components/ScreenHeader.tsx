type ScreenHeaderProps = {
  title: string;
  subtitle: string;
};

const ScreenHeader = ({ title, subtitle }: ScreenHeaderProps) => {
  return (
    <header className="mb-6 rounded-3xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 shadow-sm sm:p-8">
      <h1 className="font-[var(--font-display)] text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-xl leading-relaxed text-[var(--text-muted)] sm:text-2xl">{subtitle}</p>
    </header>
  );
};

export default ScreenHeader;
