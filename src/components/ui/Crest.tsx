'use client';

import type { ResolvedCharacter, World } from '@/lib/world';

// Brasões originais (não são os brasões desenhados por Tolkien): um anel, uma estrela
// e a inicial, com as cores do ramo da família. Servem até o leitor enviar um retrato.

type Palette = { field: string; ring: string; star: string; ink: string };

const PALETTES: Record<string, Palette> = {
  finwe: { field: '#1d2a3a', ring: '#e6cd8c', star: '#f3e2ae', ink: '#f3e2ae' },
  feanor: { field: '#3a1510', ring: '#d99a5b', star: '#f0b878', ink: '#ffe0bd' },
  fingolfin: { field: '#14253a', ring: '#b9c7d6', star: '#e6eef7', ink: '#e6eef7' },
  finarfin: { field: '#3a2e10', ring: '#e6cd8c', star: '#f7e3a3', ink: '#fff3cf' },
  thingol: { field: '#1b2e1d', ring: '#c9d6c3', star: '#e8f0e2', ink: '#eef5e9' },
  melian: { field: '#1d1f38', ring: '#c8c3e6', star: '#ece8ff', ink: '#ece8ff' },
  teleri: { field: '#10303a', ring: '#a8d2dc', star: '#e2f4f8', ink: '#e2f4f8' },
  morgoth: { field: '#120c0a', ring: '#7a2a18', star: '#c0643a', ink: '#e8a27a' },
};

export function branchOf(world: World, c: ResolvedCharacter): keyof typeof PALETTES {
  if (c.id === 'morgoth') return 'morgoth';
  if (c.id === 'melian') return 'melian';
  if (c.povo === 'teleri') return 'teleri';
  if (c.casa === 'thingol') return 'thingol';
  const seen = new Set<string>();
  let frontier = [c.id];
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      if (id === 'feanor' || id === 'fingolfin' || id === 'finarfin') return id;
      if (seen.has(id)) continue;
      seen.add(id);
      const ch = world.characters.get(id);
      ch?.pais.forEach((p) => next.push(p.valor));
    }
    frontier = next;
  }
  // cônjuges entram no ramo do marido/esposa
  for (const s of c.conjuges) {
    if (s.valor === 'feanor' || s.valor === 'finarfin' || s.valor === 'fingolfin') return s.valor;
  }
  return 'finwe';
}

export function Crest({ world, character, size = 120 }: { world: World; character: ResolvedCharacter; size?: number }) {
  const p = PALETTES[branchOf(world, character)];
  const initial = character.nome.replace(/^[^A-Za-zÀ-ú]+/, '').charAt(0);
  const rays = 8;
  const star = Array.from({ length: rays * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 46 : 18;
    const a = (Math.PI * i) / rays - Math.PI / 2;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');
  const gid = `crest-${character.id}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <defs>
        <radialGradient id={gid} cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor={p.field} stopOpacity="0.75" />
          <stop offset="1" stopColor={p.field} />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <polygon points={star} fill={p.star} opacity="0.13" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={p.ring} strokeWidth="0.8" opacity="0.8" />
      <circle cx="50" cy="50" r="24" fill="none" stroke={p.ring} strokeWidth="0.4" strokeDasharray="1 2" opacity="0.7" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Cinzel Decorative', 'Cinzel', serif"
        fontWeight={700}
        fontSize="28"
        fill={p.ink}
      >
        {initial}
      </text>
    </svg>
  );
}
