import type { NextConfig } from 'next'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : null
const supabase = SUPABASE_HOST ? ` https://${SUPABASE_HOST}` : ''

/**
 * Content Security Policy, no mesmo molde da 057.
 *
 * 'unsafe-inline' em script-src é concessão consciente: o Next entrega a
 * hidratação do React em scripts inline e as páginas são estáticas (ISR), o
 * que impede nonce por requisição. Não existe dangerouslySetInnerHTML com
 * texto de usuário neste projeto (só o JSON-LD, montado com dados nossos).
 */
const csp = [
  "default-src 'self'",
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabase}`,
  "font-src 'self' data:",
  `connect-src 'self'${supabase}`,
  "object-src 'none'",
  "base-uri 'self'",
  // O formulário posta em /atendimento, que redireciona pro WhatsApp. O Chrome
  // aplica form-action também ao redirecionamento.
  "form-action 'self' https://wa.me https://api.whatsapp.com",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  // As imagens já saem prontas do scripts/processar-imagens.mjs (AVIF e WebP
  // em várias larguras, servidas por <picture>). Sem o otimizador da Vercel,
  // que no plano Hobby tem cota e derrubou as fotos da 057 em 2026-09-17.
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: {
    // CSS dentro do <head>: some o pedido de CSS que travava a primeira pintura.
    inlineCss: false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
      {
        source: '/img/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
