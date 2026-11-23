'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { chapterIndex } from '@/data/chapters';
import { mapLayer } from '@/data/generated/map-layer';
import { GONDOLIN_MARKER_REVEAL, labelLod, labelPartReveal, labelReveal, lodForZoom } from '@/data/map-regions';
import type { TerritoryId } from '@/lib/types';
import type { World } from '@/lib/world';
import { PanZoom, type FlyOptions, type PanZoomHandle } from '@/components/ui/PanZoom';

const [VX, VY, VW, VH] = mapLayer.viewBox;
export const MAP_W = 2400;
export const MAP_H = Math.round((MAP_W * VH) / VW);
const K = MAP_W / VW;

export interface MapCanvasHandle {
  flyToTerritories: (ids: TerritoryId[], opts?: FlyOptions) => void;
  fit: (opts?: { offsetRight?: number; offsetBottom?: number }) => void;
  zoomBy: (f: number) => void;
}

interface Props {
  world: World;
  selected?: TerritoryId;
  related: TerritoryId[];
  onSelect: (id: TerritoryId) => void;
  onHover?: (id: TerritoryId | null) => void;
  className?: string;
}

export const MapCanvas = forwardRef<MapCanvasHandle, Props>(function MapCanvas(
  { world, selected, related, onSelect, onHover, className },
  ref,
) {
  const camera = useRef<PanZoomHandle>(null);
  const shapes = useRef(new Map<TerritoryId, SVGGraphicsElement>());
  const [lod, setLod] = useState<0 | 1 | 2>(0);
  // a arte em alta resolução só é carregada quando o usuário aproxima o mapa
  const [hiRes, setHiRes] = useState(false);
  useEffect(() => {
    // no celular a versão 4800px pesa demais na memória; fica a de 2400px
    if (lod === 0 || hiRes || window.innerWidth < 768) return;
    const img = new Image();
    img.src = '/maps/beleriand-base@2x.webp';
    img.decode().then(() => setHiRes(true)).catch(() => setHiRes(true));
  }, [lod, hiRes]);
  const [hover, setHover] = useState<TerritoryId | null>(null);
  const seen = useCallback((c: string) => chapterIndex(c as never) <= world.progress, [world.progress]);

  useImperativeHandle(ref, () => ({
    flyToTerritories(ids, opts) {
      const boxes = ids.map((id) => shapes.current.get(id)?.getBBox()).filter(Boolean) as DOMRect[];
      if (!boxes.length) return;
      const x0 = Math.min(...boxes.map((b) => b.x));
      const y0 = Math.min(...boxes.map((b) => b.y));
      const x1 = Math.max(...boxes.map((b) => b.x + b.width));
      const y1 = Math.max(...boxes.map((b) => b.y + b.height));
      const pad = 6;
      camera.current?.flyTo(
        { x: (x0 - pad - VX) * K, y: (y0 - pad - VY) * K, w: (x1 - x0 + 2 * pad) * K, h: (y1 - y0 + 2 * pad) * K },
        opts,
      );
    },
    fit: (o) => camera.current?.fit(o),
    zoomBy: (f) => camera.current?.zoomBy(f),
  }));

  const relatedSet = useMemo(() => new Set(related), [related]);

  const visibleLabels = useMemo(
    () =>
      mapLayer.labels
        .filter((l) => {
          if (labelReveal[l.id] && !seen(labelReveal[l.id])) return false;
          if (l.territory) {
            const t = world.territories.get(l.territory);
            if (!t || t.velado) return false;
          }
          return true;
        })
        .map((l) => ({
          ...l,
          parts: l.parts.filter((_, i) => {
            const rev = labelPartReveal[l.id]?.[i];
            return !rev || seen(rev);
          }),
          lod: labelLod(l.cls, !!l.territory),
        })),
    [world, seen],
  );

  const setHoverBoth = (id: TerritoryId | null) => {
    setHover(id);
    onHover?.(id);
  };

  return (
    <PanZoom
      ref={camera}
      width={MAP_W}
      height={MAP_H}
      minRel={0.8}
      maxRel={8}
      onZoomChange={(rel) => setLod((prev) => (lodForZoom(rel) === prev ? prev : lodForZoom(rel)))}
      className={className}
    >
      {/* Arte do mapa como imagem: leve para o zoom */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hiRes ? '/maps/beleriand-base@2x.webp' : '/maps/beleriand-base.webp'}
        decoding="async"
        alt="Mapa de Beleriand"
        width={MAP_W}
        height={MAP_H}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ borderRadius: 6, boxShadow: '0 40px 120px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(184,146,63,.25)' }}
      />
      <svg
        viewBox={mapLayer.viewBox.join(' ')}
        width={MAP_W}
        height={MAP_H}
        className="absolute inset-0"
        role="group"
        aria-label="Territórios de Beleriand"
      >
        <defs>
          <linearGradient id="ouro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7e3a3" />
            <stop offset=".5" stopColor="#c99a3e" />
            <stop offset="1" stopColor="#8a6420" />
          </linearGradient>
          <filter id="nevoa" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" result="d" />
            <feGaussianBlur in="d" stdDeviation="2.2" />
          </filter>
        </defs>

        {seen(GONDOLIN_MARKER_REVEAL) && <g dangerouslySetInnerHTML={{ __html: mapLayer.gondolinMarker }} />}

        <g className="map-layer">
          {mapLayer.territories.map((shape) => {
            const t = world.territories.get(shape.id);
            if (!t) return null;
            const cls = [
              'territorio',
              shape.shape === 'circle' ? 'ponto' : '',
              t.velado ? 'is-veiled' : '',
              selected === shape.id ? 'is-selected' : '',
              relatedSet.has(shape.id) && selected !== shape.id ? 'is-related' : '',
              hover === shape.id ? 'is-hover' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const common = {
              className: cls,
              ref: (el: SVGGraphicsElement | null) => {
                if (el) shapes.current.set(shape.id, el);
              },
              onClick: () => onSelect(shape.id),
              onPointerEnter: () => setHoverBoth(shape.id),
              onPointerLeave: () => setHoverBoth(null),
              tabIndex: 0,
              role: 'button',
              'aria-label': t.velado ? 'Lugar ainda oculto' : t.nome,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(shape.id);
              },
            };
            return shape.shape === 'path' ? (
              <path key={shape.id} d={shape.d} {...common} />
            ) : (
              <circle key={shape.id} cx={shape.cx} cy={shape.cy} r={shape.r} {...common} />
            );
          })}
        </g>

        <g className="map-labels" data-lod={lod}>
          {visibleLabels.map((l) => {
            const active = l.territory && (l.territory === selected || l.territory === hover || relatedSet.has(l.territory));
            return (
              <text key={l.id} className={`${l.cls} lod-${l.lod} ${active ? 'is-active' : ''}`} transform={l.transform}>
                {l.parts.length === 1 && !l.parts[0].cls
                  ? l.parts[0].text
                  : l.parts.map((p, i) =>
                      p.cls || p.x || p.dy ? (
                        <tspan key={i} className={p.cls} x={p.x} dy={l.parts.length === 1 ? undefined : p.dy}>
                          {p.text}
                        </tspan>
                      ) : (
                        <tspan key={i}>{p.text}</tspan>
                      ),
                    )}
              </text>
            );
          })}
          {mapLayer.titles.map((t) => (
            <text key={t.cls} className={t.cls} x={t.x} y={t.y}>
              {t.text}
            </text>
          ))}
        </g>
      </svg>
    </PanZoom>
  );
});
