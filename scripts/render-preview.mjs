import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const distHtml = path.join(projectRoot, 'dist', 'index.html')
const outDir = path.join(projectRoot, 'preview')
const outFile = path.join(outDir, 'topbar-preview.png')

if (!fs.existsSync(distHtml)) {
  console.error(`Missing build output at: ${distHtml}`)
  console.error('Run `npm run build` first.')
  process.exit(1)
}

fs.mkdirSync(outDir, { recursive: true })

const candidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
]

const executablePath = candidates.find((p) => fs.existsSync(p))
if (!executablePath) {
  console.error('No supported browser executable found.')
  console.error('Install Chrome (or Edge/Chromium) and retry.')
  process.exit(1)
}

const url = new URL(`file://${distHtml}`)

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
  await page.goto(url.toString(), { waitUntil: 'networkidle0' })

  // Ensure top bar is visible even if content grows.
  await page.evaluate(() => window.scrollTo(0, 0))
  await new Promise((r) => setTimeout(r, 200))

  await page.screenshot({ path: outFile, fullPage: false })
  console.log(`Saved preview: ${outFile}`)
} finally {
  await browser.close()
}

