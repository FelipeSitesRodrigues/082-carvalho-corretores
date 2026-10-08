import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente do navegador, para o painel enviar foto direto ao Storage (Server
 * Action aceita 1 MB e a Vercel corta o corpo em 4,5 MB). A escrita continua
 * protegida pelas policies do bucket, que exigem sessão de equipe.
 */
export function criarClienteNavegador() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
