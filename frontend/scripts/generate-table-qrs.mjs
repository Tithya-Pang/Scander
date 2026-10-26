import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';

const [base, countText = '8', tablesFile] = process.argv.slice(2);
if (!base) throw new Error('Usage: npm run qr:tables -- http://YOUR-WIFI-IP:5173 [table-count]');
const origin = new URL(base);
if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Use an HTTP or HTTPS frontend address.');
if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(origin.hostname)) {
  throw new Error('Use your Wi-Fi IP or deployed frontend domain so phones can open the link.');
}
const count = Number(countText);
if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('Table count must be between 1 and 100.');
const directory = fileURLToPath(new URL('../public/table-qr-codes/', import.meta.url));
await mkdir(directory, { recursive: true });
const tables = tablesFile ? JSON.parse(await readFile(tablesFile, 'utf8')) : Array.from({ length: count }, (_, index) => ({ id: index + 1, number: String(index + 1) }));
const cards = [];
const manifest = [];
for (const table of tables) {
  const id = table.id;
  const url = new URL('/customer/menu', origin);
  url.searchParams.set('table', table.number);
  if (table.token) url.searchParams.set('qr', table.token);
  const svg = renderToStaticMarkup(React.createElement(QRCodeSVG, {
    xmlns: 'http://www.w3.org/2000/svg',
    value: url.toString(), size: 240, level: 'M', marginSize: 4,
    title: `Gather Grounds — Table ${table.number}`,
  }));
  const filename = `table-${String(id).padStart(2, '0')}.svg`;
  await writeFile(`${directory}/${filename}`, svg);
  cards.push(React.createElement('article', { key: id },
    React.createElement('h2', null, 'Gather Grounds'),
    React.createElement('p', null, `Table ${table.number}`),
    React.createElement('img', { src: filename, alt: `Scan for table ${table.number}`, width: 240, height: 240 }),
    React.createElement('p', null, 'Scan to explore our menu'),
    React.createElement('a', { href: url.toString() }, 'Open menu'),
  ));
  manifest.push({ table: id, url: url.toString(), file: filename });
}
const html = renderToStaticMarkup(React.createElement('html', { lang: 'en' },
  React.createElement('head', null,
    React.createElement('meta', { charSet: 'UTF-8' }),
    React.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
    React.createElement('title', null, 'Gather Grounds — Table QR Codes'),
    React.createElement('style', null, 'body{font:16px system-ui;color:#194e38;margin:24px}main{display:flex;flex-wrap:wrap;gap:24px}article{border:1px solid #ddd;border-radius:12px;padding:24px;text-align:center;break-inside:avoid}h2{margin:0}a{color:inherit}@media print{a{display:none}body{margin:0}article{margin-bottom:20px}}'),
  ),
  React.createElement('body', null, React.createElement('h1', null, 'Table QR Codes'),
    React.createElement('p', null, 'Use your browser’s Print command to print these cards. Local links require the same Wi-Fi and a running frontend.'),
    React.createElement('main', null, ...cards)),
));
await writeFile(`${directory}/index.html`, '<!doctype html>' + html);
await writeFile(`${directory}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${tables.length} table QR codes in public/table-qr-codes/`);
console.log(`Print: ${new URL('/table-qr-codes/index.html', origin)}`);
console.log(tablesFile ? 'Generated links use active database table tokens.' : 'These are preview table numbers only; provide an exported table file for ordering.');
