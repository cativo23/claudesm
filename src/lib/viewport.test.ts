import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRows, computeWindow, selectedRowIndex } from './viewport.js';
import type { ProjectRecord, Session } from './types.js';

function makeSession(id: string): Session {
  return {
    id,
    projectSlug: 's',
    projectDisplay: '/p',
    cwd: '/p',
    filePath: '/tmp/x',
    timestamp: new Date(),
    messageCount: 0,
    description: '',
    tools: {},
    isCurrent: false,
    sizeBytes: 0,
  };
}

function projects(): ProjectRecord[] {
  return [
    { slug: 'a', display: '/a', sessions: [makeSession('a1'), makeSession('a2')] },
    { slug: 'b', display: '/b', sessions: [makeSession('b1')] },
  ];
}

test('buildRows: emits a header before each group followed by its sessions', () => {
  const rows = buildRows(projects());
  // header /a, a1, a2, header /b, b1
  assert.equal(rows.length, 5);
  assert.equal(rows[0]!.kind, 'header');
  assert.equal(rows[1]!.kind, 'session');
  assert.equal(rows[3]!.kind, 'header');
});

test('buildRows: session rows carry a sequential flat index', () => {
  const rows = buildRows(projects());
  const sessionRows = rows.filter(r => r.kind === 'session');
  assert.deepEqual(sessionRows.map(r => (r as { index: number }).index), [0, 1, 2]);
});

test('selectedRowIndex: maps a flat session index to its row position', () => {
  const rows = buildRows(projects());
  assert.equal(selectedRowIndex(rows, 0), 1); // a1 after header
  assert.equal(selectedRowIndex(rows, 2), 4); // b1 after both headers
});

test('computeWindow: shows everything when it fits', () => {
  assert.deepEqual(computeWindow(5, 0, 10), { start: 0, end: 5 });
});

test('computeWindow: window size never exceeds height', () => {
  const { start, end } = computeWindow(100, 50, 10);
  assert.equal(end - start, 10);
});

test('computeWindow: selection stays inside the window (top)', () => {
  const { start, end } = computeWindow(100, 0, 10);
  assert.ok(0 >= start && 0 < end);
  assert.equal(start, 0);
});

test('computeWindow: selection stays inside the window (bottom)', () => {
  const sel = 99;
  const { start, end } = computeWindow(100, sel, 10);
  assert.ok(sel >= start && sel < end);
  assert.equal(end, 100);
});

test('computeWindow: selection stays inside the window (middle, centered)', () => {
  const sel = 50;
  const { start, end } = computeWindow(100, sel, 10);
  assert.ok(sel >= start && sel < end);
  assert.equal(start, 45);
});

test('computeWindow: height of zero yields empty window', () => {
  assert.deepEqual(computeWindow(10, 3, 0), { start: 0, end: 0 });
});
