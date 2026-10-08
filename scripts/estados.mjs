// Prints dos estados interativos: menu do celular aberto e resultado do simulador.
import puppeteer from 'puppeteer-core'
const BASE = process.env.BASE || 'http://localhost:3082'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' })
let p = await b.newPage()
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await p.goto(BASE + '/', { waitUntil: 'load' })
await p.screenshot({ path: 'revisao/estado-topo-390.png' })
await p.click('button[aria-controls="menu-celular"]')
await new Promise((r) => setTimeout(r, 400))
await p.screenshot({ path: 'revisao/estado-menu-390.png' })
await p.close()
for (const w of [1440, 390]) {
  p = await b.newPage()
  await p.setViewport({ width: w, height: w < 700 ? 844 : 900, isMobile: w < 700 })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto(BASE + '/#simulador', { waitUntil: 'load' })
  await new Promise((r) => setTimeout(r, 400))
  await p.evaluate(() => document.getElementById('simulador').scrollIntoView())
  await p.click('#simulador button[type="submit"]')
  await new Promise((r) => setTimeout(r, 500))
  const el = await p.$('#simulador')
  await el.screenshot({ path: `revisao/estado-simulador-${w}.png` })
  await p.close()
}
await b.close()
console.log('ok')
