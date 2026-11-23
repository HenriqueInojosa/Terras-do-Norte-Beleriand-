'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';

/** Transição de entrada de cada página: surge do pergaminho, sem salto. */
export default function Template({ children }: { children: React.ReactNode }) {
  // No Atlas, só opacidade: um transform aqui viraria referência para o mapa
  // em tela cheia (position: fixed) e o mapa nasceria com altura zero.
  const fullscreen = usePathname() === '/';
  return (
    <motion.div
      initial={fullscreen ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={fullscreen ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
