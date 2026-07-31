#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { transform } from 'esbuild';

// Android 9 / Amlogic TV WebViews are often Chrome 66–74.
// chrome83 still emits `??` (Chrome 80+), which white-screens those devices.
// chrome69 downlevels `??` / `?.` / logical assignment in application code.
const TARGET = 'chrome69';
// Hard-fail only on logical assignment: unambiguous and never appears in polyfill
// feature-detect regexes (e.g. `/()??/`) or minified ternaries (`E?.3:1`).
const UNSUPPORTED_LOGICAL_ASSIGNMENT = /(\?\?=|\|\|=|&&=)/;

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectJavaScriptFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectJavaScriptFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(entryPath);
    }
  }

  return files;
}

async function transpileFile(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const result = await transform(source, {
    target: TARGET,
    loader: 'js',
    minify: true,
    legalComments: 'none',
  });

  await fs.writeFile(filePath, result.code);

  if (UNSUPPORTED_LOGICAL_ASSIGNMENT.test(result.code)) {
    throw new Error(`${filePath} still contains logical assignment syntax after ${TARGET} transpilation.`);
  }
}

async function main() {
  const roots = process.argv.slice(2);
  const assetRoots = roots.length > 0 ? roots : ['.next/static', '.vercel/output/static/_next/static'];
  let processedFiles = 0;
  let existingRoots = 0;

  for (const root of assetRoots) {
    const rootDir = path.resolve(process.cwd(), root);

    if (!await pathExists(rootDir)) {
      continue;
    }

    existingRoots += 1;
    const files = await collectJavaScriptFiles(rootDir);

    for (const file of files) {
      await transpileFile(file);
      processedFiles += 1;
    }
  }

  if (existingRoots === 0) {
    console.log(`No client asset directories found for ${TARGET} transpilation.`);
    return;
  }

  console.log(`Transpiled ${processedFiles} client JavaScript asset(s) for ${TARGET}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
