/**
 * Bateria de teste do site (precisa do servidor em BASE, padrão localhost:3082).
 *
 *   node scripts/testar.mjs
 *
 * 1. Estouro horizontal em 10 larguras, de 320 a 1920, nas 4 páginas
 * 2. Erros de console e requisições quebradas
 * 3. Imagem esticada: proporção natural x renderizada (memória img-height-auto-estica)
 * 4. Revelação no scroll com animação LIGADA, rolando na roda do mouse
 *    (o print padrão roda com menos movimento e esconde esse bug)
 * 5. Links internos respondem 200; links de WhatsApp têm número e texto
 * 6. Simulador: clicar dá a parcela certa (Price, 11% a.a.)
 * 7. Formulário: validação aparece e o POST em /atendimento volta 303 pro wa.me
 * 8. Menu do celular abre, trava a rolagem e fecha no Esc
 */
import puppeteer from 'puppeteer-core'
import { existsSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:3082'
const PAGINAS = ['/', '/imoveis', '/imoveis/casa-3-quartos-calmon-viana-poa', '/politica-de-privacidade']
const LARGURAS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1600, 1920]
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)

let falhas = 0
const ok = (cond, msg) => {
  if (cond) console.log('  ok   ' + msg)
  else {
    falhas++
    console.log('  FALHA ' + msg)
  }
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new' })

async function abrir(rota, largura, { movimento = false } = {}) {
  const page = await browser.newPage()
  const erros = []
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
  page.on('pageerror', (e) => erros.push(String(e)))
  page.on('requestfailed', (r) => !r.url().includes('_rsc') && erros.push('falhou ' + r.url()))
  page.on('response', (r) => r.status() >= 400 && !r.url().includes('_rsc') && erros.push(`${r.status()} ${r.url()}`))
  await page.setViewport({ width: largura, height: largura < 700 ? 844 : 900, isMobile: largura < 700, hasTouch: largura < 700 })
  if (!movimento) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(BASE + rota, { waitUntil: 'load' })
  await new Promise((r) => setTimeout(r, 500))
  return { page, erros }
}

// 1 a 3 -------------------------------------------------------------------
console.log('\n1-3. estouro, console, proporção das imagens')
for (const rota of PAGINAS) {
  for (const w of LARGURAS) {
    const { page, erros } = await abrir(rota, w)
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
        scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
    })
    await page.evaluate(() => Promise.race([Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)))), new Promise((r) => setTimeout(r, 3000))]))
    const r = await page.evaluate(() => {
      const esticadas = [...document.images]
        .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && getComputedStyle(i).objectFit !== 'cover' && getComputedStyle(i).objectFit !== 'contain')
        .filter((i) => {
          const b = i.getBoundingClientRect()
          return Math.abs(b.width / b.height - i.naturalWidth / i.naturalHeight) / (i.naturalWidth / i.naturalHeight) > 0.03
        })
        .map((i) => i.currentSrc.split('/').pop())
      return { sw: document.documentElement.scrollWidth, esticadas }
    })
    const problemas = []
    if (r.sw > w) problemas.push(`estouro ${r.sw}px`)
    if (r.esticadas.length) problemas.push('esticada: ' + r.esticadas.join(', '))
    if (erros.length) problemas.push('console: ' + erros.slice(0, 3).join(' | '))
    ok(!problemas.length, `${rota} @${w} ${problemas.join(' · ')}`)
    await page.close()
  }
}

// 4 ---------------------------------------------------------------------
console.log('\n4. revelação com animação ligada (roda do mouse)')
for (const w of [1440, 390]) {
  const { page } = await abrir('/', w, { movimento: true })
  for (let i = 0; i < 80; i++) {
    await page.mouse.wheel({ deltaY: 300 })
    await new Promise((r) => setTimeout(r, 40))
  }
  await new Promise((r) => setTimeout(r, 1200))
  // vale a opacidade final, não a classe (no carrossel do celular o card nasce visível)
  const faltando = await page.evaluate(() =>
    [...document.querySelectorAll('[data-revela]')].filter((e) => getComputedStyle(e).opacity !== '1').map((e) => e.closest('section')?.id || e.tagName),
  )
  ok(!faltando.length, `@${w} todos os [data-revela] apareceram ${faltando.length ? '(faltam: ' + [...new Set(faltando)].join(', ') + ')' : ''}`)
  await page.close()
}

// 5 ---------------------------------------------------------------------
console.log('\n5. links')
{
  const { page } = await abrir('/', 1440)
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.href))
  const internos = [...new Set(links.filter((h) => h.startsWith(BASE)).map((h) => h.split('#')[0]))]
  for (const h of internos) {
    const res = await fetch(h, { redirect: 'manual' })
    ok(res.status === 200, `${res.status} ${h.replace(BASE, '') || '/'}`)
  }
  const zaps = links.filter((h) => h.includes('wa.me'))
  ok(zaps.length > 0 && zaps.every((h) => /wa\.me\/\d{12,13}\?text=.{10,}/.test(h)), `${zaps.length} links de WhatsApp com número e mensagem`)
  await page.close()
}

// 6 ---------------------------------------------------------------------
console.log('\n6. simulador')
{
  const { page } = await abrir('/', 1440)
  await page.evaluate(() => document.getElementById('simulador').scrollIntoView())
  await page.click('#simulador button[type="submit"]')
  await new Promise((r) => setTimeout(r, 700))
  const texto = await page.$eval('#simulador [aria-live]', (e) => e.textContent)
  // 256.000 financiados, 360 meses, 11% a.a. efetivo -> R$ 2.338
  ok(/R\$\s?2\.338/.test(texto), `parcela de R$ 320 mil com 64 mil de entrada em 30 anos: ${texto.match(/R\$\s?[\d.]+/)?.[0]}`)
  await page.close()
}

// 7 ---------------------------------------------------------------------
console.log('\n7. formulário')
{
  const { page } = await abrir('/#contato', 1440)
  await page.waitForSelector('#form-contato form', { timeout: 5000 })
  await page.click('#form-contato button[type="submit"]')
  const erros = await page.$$eval('#form-contato [aria-invalid="true"]', (els) => els.length)
  ok(erros === 2, `envio vazio marca os 2 campos (${erros})`)
  const res = await fetch(BASE + '/atendimento', {
    method: 'POST',
    redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ nome: 'Teste Automático', telefone: '(11) 98765-4321', interesse: 'vender', origem: 'contato' }),
  })
  const destino = res.headers.get('location') || ''
  ok(res.status === 303 && destino.startsWith('https://wa.me/') && decodeURIComponent(destino).includes('vender meu imóvel'), `POST /atendimento → ${res.status} ${destino.slice(0, 60)}…`)
  await page.close()
}

// 8 ---------------------------------------------------------------------
console.log('\n8. menu do celular')
{
  const { page } = await abrir('/', 390)
  await page.click('button[aria-controls="menu-celular"]')
  await new Promise((r) => setTimeout(r, 500))
  const aberto = await page.evaluate(() => ({
    expandido: document.querySelector('button[aria-controls="menu-celular"]').getAttribute('aria-expanded'),
    travado: document.documentElement.style.overflow,
    visivel: getComputedStyle(document.getElementById('menu-celular')).visibility,
  }))
  ok(aberto.expandido === 'true' && aberto.travado === 'hidden' && aberto.visivel === 'visible', `abre e trava a rolagem ${JSON.stringify(aberto)}`)
  await page.keyboard.press('Escape')
  await new Promise((r) => setTimeout(r, 500))
  const fechado = await page.evaluate(() => document.querySelector('button[aria-controls="menu-celular"]').getAttribute('aria-expanded'))
  ok(fechado === 'false', 'Esc fecha')
  await page.close()
}

await browser.close()
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo')
process.exit(falhas ? 1 : 0)
