import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render } from 'ink-testing-library';
import { App } from './App.js';
import type { ProjectRecord, Session } from '../lib/types.js';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function session(id: string, projectDisplay: string, description: string): Session {
  return {
    id,
    projectSlug: projectDisplay,
    projectDisplay,
    cwd: projectDisplay,
    filePath: `/tmp/${id}.jsonl`,
    timestamp: new Date(),
    messageCount: 1,
    description,
    tools: {},
    isCurrent: false,
    sizeBytes: 1024,
  };
}

// 60 sessions across 3 projects — comfortably more than a default 24-row terminal.
function manyProjects(): ProjectRecord[] {
  const mk = (display: string, prefix: string, n: number): ProjectRecord => ({
    slug: prefix,
    display,
    sessions: Array.from({ length: n }, (_, i) =>
      session(`${prefix}${String(i).padStart(6, '0')}-aaaa`, display, `${prefix} task ${i}`)
    ),
  });
  return [
    mk('/home/user/bluemedical', 'blue', 20),
    mk('/home/user/lumira', 'lum', 20),
    mk('/home/user/claudesm', 'csm', 20),
  ];
}

const noop = () => {};
const noopAsync = async () => {};

test('App: windows the list rather than rendering all 60 rows', async () => {
  const projects = manyProjects();
  const { lastFrame, unmount } = render(
    <App loadSessions={async () => projects} onResume={noop} onCopy={noop} onDelete={noopAsync} onClean={noop} />
  );
  await delay(60);
  const frame = lastFrame() ?? '';
  const idLines = frame.split('\n').filter(l => /\b(blue|lum|csm)\d{4,}/.test(l));
  assert.ok(idLines.length > 0, 'expected at least one session row');
  assert.ok(idLines.length < 60, `expected a windowed subset, got ${idLines.length} rows`);
  unmount();
});

test('App: shows total count in the info line', async () => {
  const { lastFrame, unmount } = render(
    <App loadSessions={async () => manyProjects()} onResume={noop} onCopy={noop} onDelete={noopAsync} onClean={noop} />
  );
  await delay(60);
  assert.match(lastFrame() ?? '', /60 sessions/);
  unmount();
});

test('App: pressing / then typing filters; no match shows the empty hint', async () => {
  const { lastFrame, stdin, unmount } = render(
    <App loadSessions={async () => manyProjects()} onResume={noop} onCopy={noop} onDelete={noopAsync} onClean={noop} />
  );
  await delay(60);
  stdin.write('/');
  await delay(20);
  stdin.write('zzzznomatch');
  await delay(20);
  assert.match(lastFrame() ?? '', /No sessions match/);
  unmount();
});

test('App: filtering narrows to a single project', async () => {
  const { lastFrame, stdin, unmount } = render(
    <App loadSessions={async () => manyProjects()} onResume={noop} onCopy={noop} onDelete={noopAsync} onClean={noop} />
  );
  await delay(60);
  stdin.write('/');
  await delay(20);
  stdin.write('lumira');
  await delay(20);
  const frame = lastFrame() ?? '';
  assert.match(frame, /Filter: lumira/);
  assert.match(frame, /20\/60/);
  unmount();
});
