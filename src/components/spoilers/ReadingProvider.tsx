'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CHAPTER, chapters } from '@/data/chapters';
import type { ChapterId } from '@/lib/types';
import { buildWorld, type ReadingSettings, type World } from '@/lib/world';

const STORAGE_KEY = 'atlas-beleriand:leitura';

interface ReadingContextValue {
  world: World;
  settings: ReadingSettings;
  /** false até o leitor escolher o capítulo pela primeira vez */
  chosen: boolean;
  setChapter: (c: ChapterId) => void;
  setShowComplementar: (v: boolean) => void;
}

const ReadingContext = createContext<ReadingContextValue | null>(null);

function load(): { settings: ReadingSettings; chosen: boolean } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadingSettings;
    if (!chapters.some((c) => c.id === parsed.chapter)) return null;
    return { settings: { chapter: parsed.chapter, showComplementar: !!parsed.showComplementar }, chosen: true };
  } catch {
    return null;
  }
}

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReadingSettings>({ chapter: DEFAULT_CHAPTER, showComplementar: false });
  const [chosen, setChosen] = useState(true);

  useEffect(() => {
    const stored = load();
    if (stored) setSettings(stored.settings);
    else setChosen(false);
  }, []);

  const persist = useCallback((next: ReadingSettings) => {
    setSettings(next);
    setChosen(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* navegação privada: segue só nesta sessão */
    }
  }, []);

  const value = useMemo<ReadingContextValue>(
    () => ({
      world: buildWorld(settings),
      settings,
      chosen,
      setChapter: (chapter) => persist({ ...settings, chapter }),
      setShowComplementar: (showComplementar) => persist({ ...settings, showComplementar }),
    }),
    [settings, chosen, persist],
  );

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>;
}

export function useReading() {
  const ctx = useContext(ReadingContext);
  if (!ctx) throw new Error('useReading fora do ReadingProvider');
  return ctx;
}

export function useWorld() {
  return useReading().world;
}
