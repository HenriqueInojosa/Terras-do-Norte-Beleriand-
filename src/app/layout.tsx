import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ReadingProvider } from '@/components/spoilers/ReadingProvider';
import { WelcomeDialog } from '@/components/spoilers/WelcomeDialog';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Atlas de Beleriand',
  description: 'Os reinos, os povos e as casas da Primeira Era, explorados a partir do mapa.',
};

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Uncial+Antiqua&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTS} />
        <link rel="preload" href="/maps/beleriand-base.webp" as="image" type="image/webp" />
      </head>
      <body>
        <ReadingProvider>
          <SiteHeader />
          <main className="pt-[var(--header-h)]">{children}</main>
          <WelcomeDialog />
        </ReadingProvider>
      </body>
    </html>
  );
}
