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

test('generated, local, and audit artifacts are ignored or absent', async () => {
  const gitignore = await readText('.gitignore');
  assert.match(gitignore, /^\.wrangler\/$/m);
  assert.match(gitignore, /^\.windsurf\/$/m);
  assert.match(gitignore, /^seo_qa_report_\*\.md$/m);
  assert.match(gitignore, /^QA_REPORT\*\.md$/m);
  assert.match(gitignore, /^playwright-report\/$/m);
  assert.match(gitignore, /^test-results\/$/m);
  assert.match(gitignore, /^coverage\/$/m);
  assert.equal(existsSync(repoFile('functions')), false);
  assert.equal(existsSync(repoFile('.windsurf')), false);
  assert.equal(existsSync(repoFile('QA_REPORT.md')), false);
  assert.equal(existsSync(repoFile('seo_qa_report_nous.cr_2026-05-12.md')), false);
});

test('repository metadata and operating docs are present', async () => {
  for (const file of [
    'README.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'docs/ARCHITECTURE.md',
    'docs/OPERATIONS.md',
    'docs/SEO_AND_CONTENT.md',
    '.github/pull_request_template.md',
    '.github/CODEOWNERS',
  ]) {
    assert.equal(existsSync(repoFile(file)), true, `${file} should exist`);
  }

  const packageJson = JSON.parse(await readText('package.json'));
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.homepage, 'https://nous.cr');
  assert.equal(packageJson.repository.url, 'https://github.com/nous-org/nous-official-web-v1.git');
  assert.match(packageJson.description, /AI transformation/);
  assert.ok(packageJson.scripts.validate, 'package.json should expose a full validation script');

  const readme = await readText('README.md');
  assert.match(readme, /NOUS Official Website/);
  assert.match(readme, /docs\/ARCHITECTURE\.md/);
  assert.match(readme, /docs\/OPERATIONS\.md/);
  assert.match(readme, /docs\/SEO_AND_CONTENT\.md/);
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

test('retired and legacy redirect pages do not exist as source routes', () => {
  for (const route of [
    'src/pages/about-us.astro',
    'src/pages/contact-us.astro',
    'src/pages/pricing.astro',
    'src/pages/products.astro',
    'src/pages/es/about-us.astro',
    'src/pages/es/contact-us.astro',
    'src/pages/es/pricing.astro',
    'src/pages/es/products.astro',
  ]) {
    assert.equal(existsSync(repoFile(route)), false, `${route} should be handled by edge redirects, not source pages`);
  }
});

test('unused legacy assets are not kept in source control', () => {
  for (const asset of [
    'public/1.png',
    'public/favicon.png',
    'src/assets/NousLogo.png',
    'src/assets/WebDev.webp',
    'src/assets/bg-bento.webp',
    'src/assets/bg.webp',
    'src/assets/ctaBg.webp',
    'src/assets/footerLogo.png',
    'src/assets/whats.webp',
    'src/assets/founders/FounderAlessandro.webp',
    'src/assets/founders/FounderAndrey.webp',
    'src/assets/founders/FounderRoberto.webp',
    'src/assets/images/aiautomatization.png',
    'src/assets/images/ctabg.png',
    'src/assets/images/webdevelopment.webp',
  ]) {
    assert.equal(existsSync(repoFile(asset)), false, `${asset} is an unused legacy asset`);
  }
});

test('web app manifest uses current NOUS positioning', async () => {
  const manifest = JSON.parse(await readText('public/site.webmanifest'));
  assert.equal(manifest.name, 'NOUS - AI Transformation Agency');
  assert.equal(manifest.short_name, 'NOUS');
  assert.match(manifest.description, /AI transformation/);
  assert.equal(manifest.lang, 'en');
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
