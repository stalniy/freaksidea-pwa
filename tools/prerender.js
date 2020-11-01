const http = require('http');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { promisify } = require('util');
const { createServer } = require('history-server');
const Spinnies = require('dreidels');

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
let LOCAL_APP = 'http://localhost:';
const BASE_URL = process.env.LIT_APP_PUBLIC_PATH || '';
const spinnies = new Spinnies();

async function readSitemapUrls(browser) {
  const page = await browser.newPage();
  await page.goto(LOCAL_APP);

  const urls = await page.evaluate(async () => {
    const response = await fetch('/sitemap.xml');
    const source = await response.text();
    const doc = (new DOMParser()).parseFromString(source, 'application/xml');

    return Array.from(doc.querySelectorAll('loc'))
      .map((loc) => {
        const index = loc.textContent.indexOf('://');
        const startIndex = loc.textContent.indexOf('/', index + 3);
        return loc.textContent.slice(startIndex);
      });
  });
  await page.close();

  return urls;
}

async function openTab(browser) {
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const isAbortedRequest = req.resourceType() === 'stylesheet' ||
      req.resourceType() === 'font' ||
      req.resourceType() === 'image' ||
      req.resourceType() === 'script' && !req.url().startsWith('http://localhost');

    if (isAbortedRequest) {
      req.abort()
    } else {
      req.continue()
    }
  });

  return page;
}

async function renderPage({ id, browser, iterator }, options) {
  const page = await openTab(browser);
  const output = spinnies.add(`render.${id}`);

  for (const url of iterator) {
    try {
      output.text(`[fetching]: ${url}`);
      await page.goto(LOCAL_APP + url, { waitUntil: 'networkidle2' });

      const html = await page.content();
      const fullPath = options.basePath + url.slice(BASE_URL.length);

      output.text(`[saving]: ${url}`);
      await mkdir(fullPath, { recursive: true });
      await writeFile(`${fullPath}/index.html`, html);
    } catch (error) {
      output.fail({ text: `${url}: ${error.message}` });
      break;
    }
  }

  if (output.options.status !== 'fail') {
    output.success();
  }

  await page.close();
}

async function render(browser, options) {
  let iterator;

  try {
    spinnies.add('sitemap', { text: '[sitemap]: fetching' });
    const urls = await readSitemapUrls(browser);
    iterator = urls.values();
    spinnies.get('sitemap').success();
  } catch (error) {
    spinnies.get('sitemap').fail({ text: `[sitemap]: ${error.message}` });
    return;
  }

  const jobs = Array.from({ length: 20 })
    .map((_, id) => renderPage({
      id,
      iterator,
      browser,
    }, options));

  await Promise.all(jobs);
}

async function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, () => {
      LOCAL_APP += server.address().port;
      resolve(LOCAL_APP);
    });
  });
}

async function run() {
  const basePath = `${__dirname}/../dist`;
  const app = createServer([
    { path: BASE_URL || '/', root: basePath },
    { path: '/', root: basePath },
  ]);
  const server = http.createServer(app);
  const output = spinnies.add('server');
  const browser = await puppeteer.launch();

  try {
    output.text('start server');
    const url = await listen(server);
    output.success({ text: `server has been started at ${url}` });
    await render(browser, { basePath });
  } catch (error) {
    output.fail({ text: `Server error: ${error.message}` });
  } finally {
    await browser.close();
    server.close();
  }
}

run()
  .then(() => console.log('successfully finished prerendering'))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
