import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const repoFile = (path) => new URL(`../${path}`, import.meta.url);

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

test('robots references generated sitemap index and blocks sensitive routes', async () => {
  const robots = await readFile(repoFile('public/robots.txt'), 'utf8');
  assert.match(robots, /Sitemap:\s*https:\/\/nous\.cr\/sitemap-index\.xml/);
  assert.match(robots, /Disallow:\s*\/admin/);
  assert.match(robots, /Disallow:\s*\/api\/admin\//);
});

test('repo copy avoids stale NOUS Technologies branding in source files', async () => {
  const files = [
    'src/layouts/Layout.astro',
    'src/components/seo/SEO.astro',
    'src/components/seo/OrganizationSchema.astro',
    'src/pages/api/contact.ts',
  ];

  for (const file of files) {
    const content = await readFile(repoFile(file), 'utf8');
    assert.equal(content.includes('Nous Technologies'), false, `${file} still contains stale brand copy`);
    assert.equal(content.includes('contacto@nous.cr'), false, `${file} still contains stale contact e-mail`);
  }
});
