import type { MetadataRoute } from 'next'
import { listarImoveis } from '@/lib/dados'
import { SITE_URL } from '@/lib/config'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const imoveis = await listarImoveis()
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/imoveis`, changeFrequency: 'daily', priority: 0.9 },
    ...imoveis.map((i) => ({
      url: `${SITE_URL}/imoveis/${i.slug}`,
      lastModified: i.publicadoEm || undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/politica-de-privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
