'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChapterPicker } from '@/components/spoilers/ChapterPicker';
import { SearchDialog } from './SearchDialog';

const TABS = [
  { href: '/', label: 'Atlas', match: (p: string) => p === '/' },
  { href: '/reinos/', label: 'Reinos', match: (p: string) => p.startsWith('/reinos') },
  { href: '/personagens/', label: 'Personagens', match: (p: string) => p.startsWith('/personagens') },
];

const MORE = [
  { href: '/genealogias/finwe/', label: 'Genealogias', hint: 'Casas de Finwë e de Thingol', match: '/genealogias' },
  { href: '/relacoes/', label: 'Relações', hint: 'Quem governa e quem serve a quem', match: '/relacoes' },
  { href: '/linha-do-tempo/', label: 'Linha do tempo', hint: 'A Primeira Era, em construção', match: '/linha-do-tempo' },
];

export function SiteHeader() {
  const pathname = usePathname() || '/';
  const overMap = pathname === '/';
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = MORE.find((m) => pathname.startsWith(m.match));

  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.('input, textarea');
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--header-h)]">
      {/* No Atlas o cabeçalho flutua sobre o mapa em tela cheia: degradê sem desfoque (o desfoque travava o mapa) */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          overMap
            ? 'h-[calc(100%+28px)] bg-gradient-to-b from-ink-950/95 via-ink-950/70 to-transparent'
            : 'border-b border-gold-500/20 bg-gradient-to-b from-ink-950/95 to-ink-900/80 backdrop-blur-md'
        }`}
      />
      <div className="relative mx-auto flex h-full max-w-[1600px] items-center gap-1.5 px-3 sm:gap-3 md:gap-6 md:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Atlas de Beleriand, início">
          <span className="hidden sm:block"><Emblem /></span>
          <span className="hidden flex-col leading-none lg:flex">
            <span className="font-caps text-[0.95rem] text-gold-300">Atlas de Beleriand</span>
            <span className="font-display text-[0.8rem] italic text-muted">Os Reinos do Norte</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 md:gap-1" aria-label="Seções">
          {TABS.map((t) => (
            <NavItem key={t.href} href={t.href} active={t.match(pathname)}>
              {t.label}
            </NavItem>
          ))}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`relative whitespace-nowrap px-1.5 py-2 font-caps text-[0.6rem] transition-colors sm:px-2.5 sm:text-[0.72rem] md:px-3 ${
                moreActive ? 'text-gold-200' : 'text-muted hover:text-fg'
              }`}
              aria-expanded={moreOpen}
            >
              {moreActive ? moreActive.label : 'Mais'}
              <span className="ml-1 inline-block transition-transform" style={{ transform: moreOpen ? 'rotate(180deg)' : 'none' }}>
                ▾
              </span>
              {moreActive && <ActiveBar />}
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="panel absolute left-0 top-full mt-2 w-64 rounded-lg p-1.5"
                >
                  {MORE.map((m) => (
                    <Link key={m.href} href={m.href} className="block rounded-md px-3 py-2.5 transition-colors hover:bg-gold-500/10">
                      <span className="block font-caps text-[0.72rem] text-gold-300">{m.label}</span>
                      <span className="block font-display text-[0.92rem] italic text-muted">{m.hint}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-full border border-gold-500/25 px-2 py-1.5 text-muted sm:px-3 transition-colors hover:border-gold-400/50 hover:text-fg"
            aria-label="Buscar"
          >
            <SearchIcon />
            <span className="hidden font-display text-[0.95rem] italic md:inline">Buscar</span>
            <kbd className="hidden rounded border border-line px-1.5 font-caps text-[0.6rem] text-faint md:inline">/</kbd>
          </button>
          <ChapterPicker />
        </div>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function NavItem({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`relative px-1.5 py-2 font-caps text-[0.6rem] transition-colors sm:px-2.5 sm:text-[0.72rem] md:px-3 ${
        active ? 'text-gold-200' : 'text-muted hover:text-fg'
      }`}
    >
      {children}
      {active && <ActiveBar />}
    </Link>
  );
}

function ActiveBar() {
  return (
    <motion.span
      layoutId="nav-active"
      className="absolute inset-x-2 -bottom-[13px] h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent"
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
    />
  );
}

function Emblem() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" className="transition-transform duration-700 group-hover:rotate-45">
      <circle cx="20" cy="20" r="17" fill="none" stroke="#b8923f" strokeWidth="0.8" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="#b8923f" strokeWidth="0.4" strokeDasharray="1 1.6" />
      <path
        d="M20 5 L22.2 17.8 L35 20 L22.2 22.2 L20 35 L17.8 22.2 L5 20 L17.8 17.8 Z"
        fill="url(#emb)"
        stroke="#2a1d10"
        strokeWidth="0.3"
      />
      <path d="M20 11 L21 19 L29 20 L21 21 L20 29 L19 21 L11 20 L19 19 Z" fill="#0d0b09" opacity="0.35" transform="rotate(45 20 20)" />
      <defs>
        <linearGradient id="emb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e3a3" />
          <stop offset="0.55" stopColor="#c99a3e" />
          <stop offset="1" stopColor="#8a6420" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
