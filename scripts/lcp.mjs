// Mede FCP e LCP observados (sem limitar rede), com e sem JS, várias vezes.
import puppeteer from 'puppeteer-core'
const url = process.argv[2] || 'http://localhost:3082/'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' })
for (const js of [true, false]) {
  const vals = []
  for (let i = 0; i < 4; i++) {
    const p = await b.newPage()
    await p.setJavaScriptEnabled(js)
    await p.setViewport({ width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true })
    const cdp = await p.createCDPSession()
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await p.evaluateOnNewDocument(() => {
      window.__lcp = []
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push([Math.round(e.startTime), e.element?.tagName, e.size]))).observe({ type: 'largest-contentful-paint', buffered: true })
    })
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'x=' + Math.random(), { waitUntil: 'load' })
    await new Promise((r) => setTimeout(r, 2500))
    const r = js ? await p.evaluate(() => ({ fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime), lcp: window.__lcp })) : {}
    vals.push(js ? `fcp ${r.fcp} lcp ${JSON.stringify(r.lcp)}` : 'sem js')
    await p.close()
  }
  console.log(js ? 'COM JS' : '', vals.join('\n'))
  if (!js) break
}
await b.close()
