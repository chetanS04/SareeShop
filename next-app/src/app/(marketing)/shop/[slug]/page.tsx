import { notFound } from "next/navigation";
import { ARCHETYPES, getArchetype } from "@/data/archetypes";
import ArchetypePageContent from "@/components/(frontend)/svastra/ArchetypePageContent";

export function generateStaticParams() {
  return ARCHETYPES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const archetype = getArchetype(slug);
  if (!archetype) return { title: "Shop Who You Are" };
  return {
    title: `${archetype.name} — Shop Who You Are`,
    description: archetype.blurb,
  };
}

export default async function ArchetypeShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const archetype = getArchetype(slug);
  if (!archetype) notFound();
  return <ArchetypePageContent archetype={archetype} />;
}
