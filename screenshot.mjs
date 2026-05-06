import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const existing = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || '0')).filter(Boolean);
const next = nums.length ? Math.max(...nums) + 1 : 1;

const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outputPath = path.join(screenshotDir, filename);

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });

// Force all scroll-triggered animations to their visible state
await page.evaluate(() => {
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
});
await new Promise(r => setTimeout(r, 800));

await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
