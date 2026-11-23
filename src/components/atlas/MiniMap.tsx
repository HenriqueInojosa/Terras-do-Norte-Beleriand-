'use client';

import { mapLayer } from '@/data/generated/map-layer';
import type { TerritoryId } from '@/lib/types';

const [VX, VY, VW, VH] = mapLayer.viewBox;

export function shapeBox(id: TerritoryId) {
  const s = mapLayer.territories.find((t) => t.id === id);
  if (!s) return null;
  if (s.shape === 'circle') return { x: s.cx - s.r, y: s.cy - s.r, w: 2 * s.r, h: 2 * s.r };
  const nums = s.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Recorte do mapa centrado num território, com ele destacado. */
export function MiniMap({
  id,
  zoom = 2.6,
  className,
  veiled = false,
}: {
  id: TerritoryId;
  zoom?: number;
  className?: string;
  veiled?: boolean;
}) {
  const b = shapeBox(id);
  const s = mapLayer.territories.find((t) => t.id === id);
  if (!b || !s) return null;
  const size = Math.max(b.w, b.h, 30) * zoom;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const vb = [cx - size / 2, cy - size / 2, size, size].join(' ');
  const hl = { fill: veiled ? '#efe6cf' : '#d8b25e', fillOpacity: veiled ? 0.6 : 0.3, stroke: '#fff0c2', strokeWidth: size / 160 };
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <image href="/maps/beleriand-base.webp" x={VX} y={VY} width={VW} height={VH} />
      {s.shape === 'path' ? (
        <path d={s.d} {...hl} strokeLinejoin="round" style={veiled ? { filter: 'blur(1.5px)' } : undefined} />
      ) : (
        <circle cx={s.cx} cy={s.cy} r={s.r} {...hl} strokeDasharray={`${size / 80} ${size / 80}`} />
      )}
    </svg>
  );
}
