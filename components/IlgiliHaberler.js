import HaberCard from './HaberCard';

export default function IlgiliHaberler({ haberler }) {
  if (!haberler?.length) return null;

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">İlgili Haberler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {haberler.map((haber) => (
          <HaberCard key={haber.id} haber={haber} size="compact" />
        ))}
      </div>
    </section>
  );
}
