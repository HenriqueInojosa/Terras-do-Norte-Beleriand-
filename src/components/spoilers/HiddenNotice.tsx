'use client';

import Link from 'next/link';

export function HiddenNotice({ what }: { what: string }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-28 text-center">
      <p className="font-caps text-[0.66rem] text-gold-400">Ainda oculto</p>
      <h1 className="mt-2 font-display text-4xl text-gold-200">{what} ainda não foi revelado</h1>
      <p className="mt-4 font-display text-lg italic text-muted">
        Ele aparece mais adiante no livro. Avance o seu ponto de leitura no topo da página para vê-lo.
      </p>
      <Link href="/" className="chip mt-8 py-1.5">
        Voltar ao Atlas
      </Link>
    </div>
  );
}
