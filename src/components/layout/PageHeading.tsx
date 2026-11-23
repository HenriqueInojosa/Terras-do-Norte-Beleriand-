export function PageHeading({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <header className="mx-auto max-w-6xl px-5 pb-6 pt-12 text-center md:pt-16">
      <p className="font-caps text-[0.68rem] text-gold-400">{kicker}</p>
      <h1 className="mt-2 font-display text-5xl text-gold-200 md:text-6xl">{title}</h1>
      <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
        <span className="rule-gold flex-1" />
        <span className="text-gold-500">✦</span>
        <span className="rule-gold flex-1" />
      </div>
      {intro && <p className="mx-auto mt-5 max-w-2xl font-display text-[1.2rem] italic leading-snug text-muted">{intro}</p>}
    </header>
  );
}
