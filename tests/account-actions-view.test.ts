import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

test('navbar keeps logout available below the desktop breakpoint', () => {
  const source = readFileSync(
    join(projectRoot, 'components/layout/Navbar.tsx'),
    'utf8',
  );

  assert.match(source, /\{session && \(\s*<div className="flex items-center gap-1 sm:gap-2">/);
  assert.match(source, /<div className="hidden sm:flex[^>]*>[\s\S]*?session\.name/);
  assert.doesNotMatch(source, /\{session && \(\s*<div className="hidden sm:flex/);
});

test('premium settings includes the shared account management section', () => {
  const source = readFileSync(
    join(projectRoot, 'app/premium/settings/page.tsx'),
    'utf8',
  );

  assert.match(source, /import \{ AccountSettings \} from '@\/components\/settings\/AccountSettings';/);
  assert.match(source, /<AppVersionSettings \/>[\s\S]*?<AccountSettings \/>/);
});
