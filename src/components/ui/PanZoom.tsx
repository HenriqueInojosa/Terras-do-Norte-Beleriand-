'use client';

import { animate, motion, useMotionValue, useMotionValueEvent, type AnimationPlaybackControls } from 'motion/react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FlyOptions {
  /** fração da área livre ocupada pelo retângulo (0–1) */
  fill?: number;
  /** zoom máximo relativo ao "caber na tela" */
  maxRel?: number;
  /** pixels ocupados por um painel à direita (a câmera centraliza no que sobra) */
  offsetRight?: number;
  /** pixels ocupados por um painel à esquerda */
  offsetLeft?: number;
  /** pixels ocupados embaixo (painel em telas estreitas) */
  offsetBottom?: number;
  instant?: boolean;
}

export interface PanZoomHandle {
  flyTo: (rect: Rect, opts?: FlyOptions) => void;
  zoomBy: (factor: number) => void;
  fit: (opts?: { offsetRight?: number; offsetBottom?: number }) => void;
}

interface Props {
  width: number;
  height: number;
  minRel?: number;
  maxRel?: number;
  /** como enquadrar no início: caber inteiro ('contain') ou preencher ('cover') */
  initial?: 'contain' | 'cover';
  onZoomChange?: (rel: number) => void;
  className?: string;
  children: React.ReactNode;
}

const WHEEL_SPRING = { type: 'spring', stiffness: 320, damping: 38, mass: 0.7 } as const;
const GLIDE_SPRING = { type: 'spring', stiffness: 170, damping: 30, mass: 0.9 } as const;
const FLY = { duration: 1.15, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * Câmera com zoom e arraste suaves para qualquer conteúdo (mapa ou árvore).
 * Roda do mouse e pinça com mola, arraste com inércia, voo animado até um retângulo.
 */
export const PanZoom = forwardRef<PanZoomHandle, Props>(function PanZoom(
  { width, height, minRel = 0.85, maxRel = 7, initial = 'contain', onZoomChange, className, children },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const s = useMotionValue(1);
  const target = useRef({ x: 0, y: 0, s: 1 });
  const fitScale = useRef(1);
  const anims = useRef<AnimationPlaybackControls[]>([]);
  const ready = useRef(false);

  const stop = () => {
    anims.current.forEach((a) => a.stop());
    anims.current = [];
  };

  const size = () => {
    const el = viewport.current;
    return el ? { vw: el.clientWidth, vh: el.clientHeight } : { vw: 1, vh: 1 };
  };

  const clamp = useCallback(
    (nx: number, ny: number, ns: number) => {
      const { vw, vh } = size();
      const cw = width * ns;
      const ch = height * ns;
      const margin = 0.35;
      const clampAxis = (v: number, content: number, view: number) => {
        if (content <= view) {
          const center = (view - content) / 2;
          return Math.min(Math.max(v, center - view * margin), center + view * margin);
        }
        return Math.min(Math.max(v, view - content - view * margin), view * margin);
      };
      return { x: clampAxis(nx, cw, vw), y: clampAxis(ny, ch, vh), s: ns };
    },
    [width, height],
  );

  const go = useCallback(
    (next: { x: number; y: number; s: number }, transition: object) => {
      const c = clamp(next.x, next.y, next.s);
      target.current = c;
      stop();
      anims.current = [animate(x, c.x, transition), animate(y, c.y, transition), animate(s, c.s, transition)];
    },
    [clamp, s, x, y],
  );

  const clampScale = (v: number) => Math.min(Math.max(v, fitScale.current * minRel), fitScale.current * maxRel);

  const zoomAt = useCallback(
    (factor: number, px: number, py: number, transition: object = WHEEL_SPRING) => {
      const t = target.current;
      const ns = clampScale(t.s * factor);
      const k = ns / t.s;
      go({ x: px - (px - t.x) * k, y: py - (py - t.y) * k, s: ns }, transition);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [go],
  );

  const computeFit = useCallback(
    (offsetRight = 0, offsetBottom = 0) => {
      const { vw, vh } = size();
      const aw = vw - offsetRight;
      const ah = vh - offsetBottom;
      const contain = Math.min(aw / width, ah / height);
      const cover = Math.max(vw / width, vh / height);
      fitScale.current = Math.min(vw / width, vh / height);
      const sc = initial === 'cover' ? cover : contain * 0.96;
      return { x: (aw - width * sc) / 2, y: (ah - height * sc) / 2, s: sc };
    },
    [width, height, initial],
  );

  useImperativeHandle(
    ref,
    () => ({
      flyTo(rect, opts = {}) {
        const { vw, vh } = size();
        const left = opts.offsetLeft ?? 0;
        const aw = vw - (opts.offsetRight ?? 0) - left;
        const ah = vh - (opts.offsetBottom ?? 0);
        const fill = opts.fill ?? 0.55;
        const rel = opts.maxRel ?? 4;
        let ns = Math.min((aw * fill) / Math.max(rect.w, 1), (ah * fill) / Math.max(rect.h, 1));
        ns = Math.min(Math.max(ns, fitScale.current), fitScale.current * rel);
        const next = { x: left + aw / 2 - (rect.x + rect.w / 2) * ns, y: ah / 2 - (rect.y + rect.h / 2) * ns, s: ns };
        go(next, opts.instant ? { duration: 0 } : FLY);
      },
      zoomBy(factor) {
        const { vw, vh } = size();
        zoomAt(factor, vw / 2, vh / 2, GLIDE_SPRING);
      },
      fit(opts = {}) {
        go(computeFit(opts.offsetRight, opts.offsetBottom), FLY);
      },
    }),
    [computeFit, go, zoomAt],
  );

  // Enquadramento inicial e ao redimensionar
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!ready.current) {
        const f = computeFit();
        target.current = f;
        x.set(f.x);
        y.set(f.y);
        s.set(f.s);
        ready.current = true;
      } else {
        computeFit();
        const t = target.current;
        go(t, GLIDE_SPRING);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeFit, go, s, x, y]);

  // Roda do mouse / trackpad (listener não passivo para bloquear a rolagem da página)
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      if (e.ctrlKey || Math.abs(e.deltaY) > 0 && e.deltaMode === 1) {
        zoomAt(Math.exp(-e.deltaY * 0.012), px, py);
      } else if (!e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.6 && e.deltaMode === 0 && Math.abs(e.deltaX) > 0.5) {
        // trackpad: rolar com dois dedos move o mapa
        const t = target.current;
        go({ x: t.x - e.deltaX, y: t.y - e.deltaY, s: t.s }, WHEEL_SPRING);
      } else {
        zoomAt(Math.exp(-e.deltaY * 0.0018), px, py);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [go, zoomAt]);

  // Arraste e pinça
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startDist: number; startS: number; startX: number; startY: number; mx: number; my: number } | null>(null);
  const moved = useRef(0);
  const lastMove = useRef({ t: 0, vx: 0, vy: 0 });

  const local = (e: React.PointerEvent) => {
    const r = viewport.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    stop();
    target.current = { x: x.get(), y: y.get(), s: s.get() };
    pointers.current.set(e.pointerId, local(e));
    moved.current = 0;
    lastMove.current = { t: performance.now(), vx: 0, vy: 0 };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startS: s.get(),
        startX: x.get(),
        startY: y.get(),
        mx: (a.x + b.x) / 2,
        my: (a.y + b.y) / 2,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const g = gesture.current;
      const ns = clampScale((g.startS * Math.hypot(a.x - b.x, a.y - b.y)) / g.startDist);
      const k = ns / g.startS;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const c = clamp(mx - (g.mx - g.startX) * k, my - (g.my - g.startY) * k, ns);
      x.set(c.x);
      y.set(c.y);
      s.set(c.s);
      target.current = c;
      moved.current += 10;
      return;
    }
    const dx = p.x - prev.x;
    const dy = p.y - prev.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    if (moved.current > 4) {
      viewport.current!.setPointerCapture(e.pointerId);
      const c = clamp(x.get() + dx, y.get() + dy, s.get());
      x.set(c.x);
      y.set(c.y);
      target.current = c;
      const now = performance.now();
      const dt = Math.max(now - lastMove.current.t, 1);
      lastMove.current = { t: now, vx: 0.8 * (dx / dt) + 0.2 * lastMove.current.vx, vy: 0.8 * (dy / dt) + 0.2 * lastMove.current.vy };
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0 && moved.current > 4) {
      const idle = performance.now() - lastMove.current.t > 80;
      const { vx, vy } = idle ? { vx: 0, vy: 0 } : lastMove.current;
      const t = target.current;
      go({ x: t.x + vx * 260, y: t.y + vy * 260, s: t.s }, GLIDE_SPRING);
    }
  };

  // Um arraste não deve virar clique num território
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current > 4) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const r = viewport.current!.getBoundingClientRect();
    zoomAt(e.shiftKey ? 1 / 1.8 : 1.8, e.clientX - r.left, e.clientY - r.top, GLIDE_SPRING);
  };

  // Durante o zoom a camada vira uma textura da GPU (sem redesenhar o SVG a cada quadro);
  // ao parar, o will-change sai e o navegador redesenha nítido na escala final.
  const layer = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);
  useMotionValueEvent(s, 'change', (v) => {
    onZoomChange?.(v / fitScale.current);
    const el = layer.current;
    if (!el) return;
    if (el.style.willChange !== 'transform') el.style.willChange = 'transform';
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      el.style.willChange = 'auto';
    }, 180);
  });

  return (
    <div
      ref={viewport}
      className={`relative overflow-hidden touch-none select-none ${className ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'grab' }}
    >
      <motion.div
        ref={layer}
        style={{ x, y, scale: s, width, height, transformOrigin: '0 0', position: 'absolute', left: 0, top: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
});
