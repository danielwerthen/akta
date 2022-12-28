import http from 'http';
import puppeteer, { Viewport } from 'puppeteer';

function getCSS(doc: Document) {
  const lines: string[] = [];
  const styleElements = doc.getElementsByTagName('style');
  for (let index = 0; index < styleElements.length; index++) {
    const sheet = styleElements.item(index)?.sheet;
    const media = styleElements.item(index)?.media;
    if (!sheet) {
      continue;
    }
    if (media) {
      lines.push(`@media ${media} {`);
    }
    for (let ruleIdx = 0; ruleIdx < (sheet.cssRules.length || 0); ruleIdx++) {
      const rule = sheet.cssRules[ruleIdx];
      if (rule?.cssText) {
        lines.push(rule?.cssText);
      }
    }
    if (media) {
      lines.push('}');
    }
  }

  return lines.join('\n');
}

export function createRenderer() {
  const port = 4352;
  return async function render(
    doc: Document,
    defaultViewport: Viewport = { width: 800, height: 600 }
  ) {
    const browser = await puppeteer.launch({
      defaultViewport,
    });
    const page = await browser.newPage();
    const server = http.createServer((_req, res) => {
      res.writeHead(200);
      res.end(`<html>
        <head>
          <link rel="stylesheet" href="https://unpkg.com/normalize.css@8.0.1/normalize.css" />
          <style>
            ${getCSS(doc)}
          </style>
        </head>
        ${doc.body.outerHTML}
      </html>`);
    });
    server.listen(port);
    try {
      await page.goto(`http://localhost:${port}`);
      return await page.screenshot();
    } finally {
      server.close();
      browser.close();
    }
  };
}
