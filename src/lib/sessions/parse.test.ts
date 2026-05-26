import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseSessionFile } from './parse.js';

function writeFixture(lines: object[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csm-parse-'));
  const file = path.join(dir, 'session.jsonl');
  fs.writeFileSync(file, lines.map(l => JSON.stringify(l)).join('\n') + '\n');
  return file;
}

test('parseSessionFile: extracts cwd from the first record that has one', async () => {
  const file = writeFixture([
    { type: 'snapshot' },
    { type: 'user', cwd: '/home/u/projects/app', message: { content: 'hi' }, timestamp: '2026-01-01T00:00:00Z' },
    { type: 'assistant', cwd: '/other/dir', message: { content: [] } },
  ]);
  const parsed = await parseSessionFile(file);
  assert.equal(parsed.cwd, '/home/u/projects/app');
});

test('parseSessionFile: cwd is null when absent', async () => {
  const file = writeFixture([{ type: 'user', message: { content: 'hi' } }]);
  const parsed = await parseSessionFile(file);
  assert.equal(parsed.cwd, null);
});
