import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const repoFile = (path) => new URL(`../${path}`, import.meta.url);
const readText = (path) => readFile(repoFile(path), 'utf8');

test('wrangler.toml does not commit live-looking secrets', async () => {
  const wrangler = await readFile(repoFile('wrangler.toml'), 'utf8');
  const forbiddenPatterns = [
    /RESEND_API_KEY\s*=\s*["']re_/,
    /TURSO_AUTH_TOKEN\s*=\s*["']eyJ/,
    /TURSO_NEWSLETTER_TOKEN\s*=\s*["']eyJ/,
    /GITHUB_CLIENT_SECRET\s*=\s*["'][a-f0-9]{20,}/i,
    /CLERK_SECRET_KEY\s*=\s*["']sk_(live|test)_/,
    /CLERK_PUBLISHABLE_KEY\s*=\s*["']pk_live_/,
  ];

  for (const pattern of forbiddenPatterns) {
    assert.equal(pattern.test(wrangler), false, `Found forbidden secret pattern: ${pattern}`);
  }
});

test('manual public sitemap is not present', () => {
  assert.equal(existsSync(repoFile('public/sitemap.xml')), false);
});

test('generated and local build artifacts are ignored or absent', async () => {
  const gitignore = await readText('.gitignore');
  assert.match(gitignore, /^\.wrangler\/$/m);
  assert.equal(existsSync(repoFile('functions')), false);
});

test('robots references generated sitemap index and blocks sensitive routes', async () => {
  const robots = await readText('public/robots.txt');
  assert.match(robots, /Sitemap:\s*https:\/\/nous\.cr\/sitemap-index\.xml/);
  assert.match(robots, /Disallow:\s*\/admin/);
  assert.match(robots, /Disallow:\s*\/api\/admin\//);
  assert.equal(robots.includes('Disallow: /pricing'), false);
  assert.equal(robots.includes('Disallow: /products'), false);
});

test('repo copy avoids stale NOUS Technologies branding in source files', async () => {
  const files = [
    'src/layouts/Layout.astro',
    'src/components/seo/SEO.astro',
    'src/components/seo/OrganizationSchema.astro',
    'src/pages/api/contact.ts',
  ];

  for (const file of files) {
    const content = await readText(file);
    assert.equal(content.includes('Nous Technologies'), false, `${file} still contains stale brand copy`);
    assert.equal(content.includes('contacto@nous.cr'), false, `${file} still contains stale contact e-mail`);
  }
});

test('retired pricing and products pages do not exist as source routes', () => {
  assert.equal(existsSync(repoFile('src/pages/pricing.astro')), false);
  assert.equal(existsSync(repoFile('src/pages/products.astro')), false);
  assert.equal(existsSync(repoFile('src/pages/es/pricing.astro')), false);
  assert.equal(existsSync(repoFile('src/pages/es/products.astro')), false);
});

test('edge redirects cover retired and canonical URL variants', async () => {
  const redirects = await readText('public/_redirects');
  const expectedRules = [
    '/services/ /services 301',
    '/es/ /es 301',
    '/about-us /about 301',
    '/about-us/ /about 301',
    '/contact-us /contact 301',
    '/contact-us/ /contact 301',
    '/pricing /services 301',
    '/pricing/ /services 301',
    '/products /services 301',
    '/products/ /services 301',
    '/es/pricing /es/services 301',
    '/es/products /es/services 301',
    '/blog/chatgpt-5-is-here-learn-about-its-improvements-use-cases-in-education-business-and-programming-and-the-future-of-ai /blog/building-a-more-intelligent-world 301',
  ];

  for (const rule of expectedRules) {
    assert.match(redirects, new RegExp(rule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const activeRules = redirects
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  for (const rule of activeRules) {
    assert.equal(/^https?:\/\//.test(rule), false, `Only relative _redirects rules are supported here: ${rule}`);
  }
});

test('sitemap configuration excludes retired and non-indexable routes', async () => {
  const config = await readText('astro.config.mjs');
  for (const path of ['/404', '/about-us', '/admin', '/contact-us', '/portfolio', '/pricing', '/products']) {
    assert.match(config, new RegExp(`['"]${path}['"]`));
  }
  assert.match(config, /trailingSlash:\s*['"]never['"]/);
  assert.match(config, /https:\/\/nous\.cr\/es\/blog\/building-a-more-intelligent-world/);
});

test('noindex templates keep low-value pages out of search', async () => {
  const portfolio = await readText('src/pages/portfolio.astro');
  const portfolioEs = await readText('src/pages/es/portfolio.astro');
  const notFound = await readText('src/pages/404.astro');

  assert.match(portfolio, /noindex=\{true\}/);
  assert.match(portfolioEs, /noindex=\{true\}/);
  assert.match(notFound, /noindex=\{true\}/);
  assert.match(notFound, /nofollow=\{true\}/);
  assert.match(notFound, /isErrorPage=\{true\}/);
});
