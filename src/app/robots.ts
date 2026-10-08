import type { MetadataRoute } from 'next'
import { INDEXAR, SITE_URL } from '@/lib/config'

/** Enquanto for demonstração (NEXT_PUBLIC_INDEXAR != true), nada é indexado. */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXAR) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/painel', '/entrar', '/atendimento'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
