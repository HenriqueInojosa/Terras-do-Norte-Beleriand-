'use client';

import { motion } from 'motion/react';
import type { ResolvedCharacter, World } from '@/lib/world';
import { Crest } from './Crest';

const HEX = 'polygon(50% 0%, 100% 22%, 100% 78%, 50% 100%, 0% 78%, 0% 22%)';

/** Moldura hexagonal com borda dourada: retrato, se houver, ou o brasão. */
export function HexPortrait({
  world,
  character,
  width = 112,
  active = false,
  dim = false,
  layoutId,
}: {
  world: World;
  character: ResolvedCharacter;
  width?: number;
  active?: boolean;
  dim?: boolean;
  layoutId?: string;
}) {
  const height = Math.round(width * 1.16);
  return (
    <motion.div
      layoutId={layoutId}
      className="relative shrink-0"
      style={{ width, height, filter: dim ? 'saturate(0.4) brightness(0.55)' : 'none', transition: 'filter .4s' }}
    >
      <div
        className="absolute inset-0 transition-[background] duration-500"
        style={{
          clipPath: HEX,
          background: active
            ? 'linear-gradient(160deg,#fff1c4,#d1b16a 40%,#7a5e25)'
            : 'linear-gradient(160deg,#b8923f,#5d4519 55%,#a8853a)',
        }}
      />
      <div className="absolute inset-[2px]" style={{ clipPath: HEX, background: '#0d0b09' }} />
      <div className="absolute inset-[5px] overflow-hidden" style={{ clipPath: HEX }}>
        {character.retrato ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.retrato} alt={character.nome} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink-900">
            <Crest world={world} character={character} size={Math.max(width, height)} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
