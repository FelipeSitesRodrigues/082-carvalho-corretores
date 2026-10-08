# Carvalho Corretores (082)

Site da imobiliária Carvalho Corretores, de Poá, SP. No mesmo molde da 057 Ultra Veículos:
vitrine pública de imóveis agora, painel de cadastro na próxima fase.

A documentação do cliente (memória, prompt do mockup, mockup aprovado, fotos originais)
fica em `../082 - Carvalho Corretores/`. Esta pasta é só código.

## Rodar

```bash
npm install
npm run imagens   # gera public/img e src/lib/dados/fotos.gerado.json a partir de "Recursos Site"
npm run dev       # http://localhost:3000
```

Produção local: `npx next build && npx next start -p 3082`.
Revisão: `MSYS_NO_PATHCONV=1 node scripts/print.mjs / 1440,390` (prints em `revisao/`).

## Stack

- Next 16 + React 19, CSS próprio (tokens em `src/app/globals.css`, um `.module.css` por componente)
- Sora (títulos) e Inter (texto) via `next/font`, auto-hospedadas
- Imagens prontas em AVIF + WebP por `scripts/processar-imagens.mjs` (sem o otimizador da Vercel, que tem cota no plano Hobby)
- Supabase preparado e desligado (ver abaixo)

## Páginas

| Rota | O que é |
| --- | --- |
| `/` | Home fiel ao mockup: hero, destaques, por que a Carvalho, simulador, bairros, como funciona, contato |
| `/imoveis` | Lista com busca (finalidade, tipo, bairro, quartos, valor, ordem). Filtros no endereço, dá pra compartilhar |
| `/imoveis/[slug]` | Página do imóvel: galeria, ficha, custos, WhatsApp com a mensagem do imóvel, parecidos |
| `/atendimento` | Recebe o formulário, grava o lead (com Supabase) e redireciona pro WhatsApp |
| `/politica-de-privacidade` | LGPD |

## Dados: dois modos, mesma página

`src/lib/dados/index.ts` é a porta única de leitura.

- **Sem Supabase** (hoje): lê a demonstração de `src/lib/dados/demo.ts` (4 imóveis do mockup + 4 do prompt).
- **Com Supabase**: com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no ambiente, lê do banco
  (`src/lib/dados/supabase.ts`). As páginas não mudam.

## Ligar o Supabase

1. Criar o projeto em **sa-east-1 (São Paulo)**. Em Authentication, **desligar o cadastro público**
   (`disable_signup`) e subir a senha mínima pra 12. Na 057 e na 081 o cadastro veio aberto.
2. Rodar `supabase/migrations/20261007120000_schema_inicial.sql` (SQL Editor ou `supabase db push`).
3. Rodar `node scripts/gerar-seed.mjs` e depois `supabase/seed.sql`: entram bairros, config e os imóveis de exemplo.
4. Criar o usuário do Marcos em Authentication e a linha dele em `perfis`:
   `insert into perfis (id, nome) values ('<uuid do usuário>', 'Marcos');`
5. Copiar `.env.example` para `.env.local` com URL e anon key. Na Vercel, as mesmas variáveis.
6. Trocar telefone, CRECI e horário reais na linha `config.imobiliaria` e mudar `dadosDeExemplo` pra `false`.
   Só então `NEXT_PUBLIC_INDEXAR=true`.

### O que o banco garante

- RLS em todas as tabelas. Visitante só lê imóvel `publicado`, foto de imóvel publicado, bairro ativo e config pública.
- `imovel_privado` (endereço completo, proprietário, valor mínimo, comissão) não tem policy pra `anon` e o grant é revogado.
- Lead só entra por `registrar_lead()`: valida nome e telefone e recusa mais de 5 envios do mesmo IP por hora.
  O IP vira hash diário, nunca é gravado em claro.
- Fotos no bucket `imoveis`: leitura pública, escrita só da equipe, até 10 MB, só imagem.

## Próxima fase: painel

Portar o painel da 057 (`FelipeSitesRodrigues/057-ultraveiculos`, pastas `src/app/painel` e `src/app/entrar`):
cadastro de imóvel com fotos (reduzidas no navegador antes do upload), status, destaque, ordem, leads.
Os clientes `src/lib/supabase/servidor.ts` e `navegador.ts` já estão aqui.

## Dados de exemplo que precisam sair antes de publicar

- Telefone `(11) 90000-0000` e `CRECI-SP 00000-J` (em `src/lib/config.ts` ou na config do banco)
- Instagram e Facebook (nulos: os ícones só aparecem quando preenchidos)
- Os três diferenciais e o texto "Corretor regularizado" pedem confirmação do Marcos
- Fotos de demonstração (Unsplash), créditos em `../082 - Carvalho Corretores/Recursos Site/FOTOS DEMO/creditos.json`
