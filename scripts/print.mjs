/**
 * Print de revisão com viewport de verdade (puppeteer-core + Chrome da máquina).
 *
 *   node scripts/print.mjs [rota] [larguras] [--movimento] [--topo]
 *   ex.: MSYS_NO_PATHCONV=1 node scripts/print.mjs / 1440,390
 *
 * Padrão: página inteira, com "menos movimento" emulado (tudo já visível).
 * --movimento liga as animações e rola a página antes do print (pega bug de
 * revelação que o modo padrão esconde). --topo tira só a primeira tela.
 * Também mede estouro horizontal (scrollWidth > largura) e erros de console.
 * Saída: revisao/<rota>-<largura>.png
 */
import puppeteer from 'puppeteer-core'
import { existsSync, mkdirSync } from 'node:fs'

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const [rota = '/', larguras = '1440,390'] = args.filter((a) => !a.startsWith('--'))
const BASE = process.env.BASE || 'http://localhost:3082'
const NAVEGADORES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]
const executablePath = NAVEGADORES.find((c) => existsSync(c))
mkdirSync('revisao', { recursive: true })

const browser = await puppeteer.launch({ executablePath, headless: 'new' })
const nomeRota = rota === '/' ? 'home' : rota.replace(/^\//, '').replace(/[/?=&#]+/g, '_')

for (const w of larguras.split(',').map(Number)) {
  const page = await browser.newPage()
  const erros = []
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
  page.on('pageerror', (e) => erros.push(String(e)))
  const altura = w < 700 ? 844 : 900
  await page.setViewport({ width: w, height: altura, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700 })
  if (!flags.has('--movimento')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(BASE + rota, { waitUntil: 'load' })
  await new Promise((r) => setTimeout(r, 700))

  if (!flags.has('--topo')) {
    // rola até o fim pra disparar lazy load e revelação, e volta
    await page.evaluate(async () => {
      const passo = Math.round(innerHeight * 0.7)
      for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
        scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      scrollTo(0, 0)
      await new Promise((r) => setTimeout(r, 400))
    })
    await page.evaluate(() => Promise.race([Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)))), new Promise((r) => setTimeout(r, 3000))]))
  }

  const medida = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    altura: document.documentElement.scrollHeight,
    largos: [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed'
      })
      .filter((el) => !el.closest('[class*="trilho"]'))
      .slice(0, 6)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} → ${Math.round(el.getBoundingClientRect().right)}`),
  }))

  const arquivo = `revisao/${nomeRota}-${w}${flags.has('--movimento') ? '-mov' : ''}.png`
  if (flags.has('--topo')) {
    await page.screenshot({ path: arquivo })
  } else {
    // janela esticada do tamanho da página (o fullPage do Chrome às vezes monta outro layout)
    await page.setViewport({ width: w, height: Math.min(medida.altura, 16000), deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700 })
    await new Promise((r) => setTimeout(r, 500))
    await page.screenshot({ path: arquivo })
  }
  console.log(`${arquivo}  altura ${medida.altura}  scrollWidth ${medida.scrollW}${medida.scrollW > w ? '  <-- ESTOURO' : ''}`)
  medida.largos.forEach((l) => console.log('   largo:', l))
  erros.forEach((e) => console.log('   console:', e.slice(0, 200)))
  await page.close()
}
await browser.close()
