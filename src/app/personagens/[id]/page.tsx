import { CharacterPage } from '@/components/characters/CharacterPage';
import { characters } from '@/data/characters';

export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CharacterPage id={id} />;
}
