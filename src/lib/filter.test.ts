import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchSession, filterProjects } from './filter.js';
import type { ProjectRecord, Session } from './types.js';

function makeSession(over: Partial<Session> = {}): Session {
  return {
    id: 'abcd1234-0000-0000-0000-000000000000',
    projectSlug: '-home-user-proj',
    projectDisplay: '/home/user/proj',
    cwd: '/home/user/proj',
    filePath: '/tmp/x.jsonl',
    timestamp: new Date(),
    messageCount: 1,
    description: 'a session',
    tools: {},
    isCurrent: false,
    sizeBytes: 0,
    ...over,
  };
}

test('matchSession: empty query matches everything', () => {
  assert.equal(matchSession(makeSession(), ''), true);
  assert.equal(matchSession(makeSession(), '   '), true);
});

test('matchSession: matches substring of id', () => {
  assert.equal(matchSession(makeSession({ id: 'deadbeef-1' }), 'beef'), true);
});

test('matchSession: matches substring of project display', () => {
  const s = makeSession({ projectDisplay: '/home/user/bluemedical' });
  assert.equal(matchSession(s, 'bluemed'), true);
});

test('matchSession: matches substring of description', () => {
  const s = makeSession({ description: 'fix the pr-review flow' });
  assert.equal(matchSession(s, 'pr-review'), true);
});

test('matchSession: case-insensitive', () => {
  const s = makeSession({ description: 'BlueMedical CRM' });
  assert.equal(matchSession(s, 'bluemedical'), true);
});

test('matchSession: multi-token requires ALL tokens (AND)', () => {
  const s = makeSession({ projectDisplay: '/home/user/crm', description: 'pr-review of doctors' });
  assert.equal(matchSession(s, 'crm pr-review'), true);
  assert.equal(matchSession(s, 'crm missing'), false);
});

test('matchSession: returns false when no token matches', () => {
  assert.equal(matchSession(makeSession({ description: 'hello' }), 'zzz'), false);
});

test('filterProjects: empty query returns projects unchanged', () => {
  const projects: ProjectRecord[] = [
    { slug: 'a', display: '/a', sessions: [makeSession({ id: '1' })] },
  ];
  assert.deepEqual(filterProjects(projects, ''), projects);
});

test('filterProjects: drops projects with no matching sessions', () => {
  const projects: ProjectRecord[] = [
    { slug: 'a', display: '/home/a', sessions: [makeSession({ id: '1', description: 'apple' })] },
    { slug: 'b', display: '/home/b', sessions: [makeSession({ id: '2', description: 'banana' })] },
  ];
  const out = filterProjects(projects, 'apple');
  assert.equal(out.length, 1);
  assert.equal(out[0]!.slug, 'a');
});

test('filterProjects: keeps only matching sessions within a project', () => {
  const projects: ProjectRecord[] = [
    {
      slug: 'a',
      display: '/home/a',
      sessions: [
        makeSession({ id: '1', description: 'apple pie' }),
        makeSession({ id: '2', description: 'banana bread' }),
      ],
    },
  ];
  const out = filterProjects(projects, 'apple');
  assert.equal(out.length, 1);
  assert.equal(out[0]!.sessions.length, 1);
  assert.equal(out[0]!.sessions[0]!.id, '1');
});
