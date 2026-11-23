import type { Credito } from '@/lib/types';

/** Linha discreta com o crédito de uma imagem de terceiros: obra, autor e licença. */
export function ImageCredit({ credito, rotulo, className = '' }: { credito: Credito; rotulo: string; className?: string }) {
  return (
    <p className={`font-display text-[0.78rem] italic leading-snug text-faint ${className}`}>
      {rotulo}:{' '}
      <a href={credito.fonte} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-gold-300">
        {credito.obra ?? 'obra original'}
      </a>
      , de {credito.autor} ·{' '}
      {credito.licencaUrl ? (
        <a href={credito.licencaUrl} target="_blank" rel="noopener noreferrer license" className="underline decoration-dotted underline-offset-2 hover:text-gold-300">
          {credito.licenca}
        </a>
      ) : (
        credito.licenca
      )}
      {credito.alterada && ' · recortada e ajustada'}
    </p>
  );
}
