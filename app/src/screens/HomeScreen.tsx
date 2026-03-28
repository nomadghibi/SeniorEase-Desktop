import HomeTile from '@/components/HomeTile';
import ScreenHeader from '@/components/ScreenHeader';
import { HOME_MODULES } from '@/lib/modules';
import { useUiStore } from '@/store/uiStore';

const HomeScreen = () => {
  const goTo = useUiStore((state) => state.goTo);

  return (
    <section>
      <ScreenHeader
        title="SeniorEase Desktop"
        subtitle="Choose what you want to do. You can always tap Help if you feel stuck."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {HOME_MODULES.map((module) => (
          <HomeTile key={module.id} module={module} onSelect={goTo} />
        ))}
      </div>
    </section>
  );
};

export default HomeScreen;
