import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECTS_DIR, decodeSlug } from '../paths.js';
import { parseSessionFile } from './parse.js';
import { ClaudeDataDirMissingError, NoSessionsFoundError } from '../errors.js';
import type { Session, ProjectRecord } from '../types.js';

export async function discoverSessions(currentSessionId: string | null): Promise<ProjectRecord[]> {
  let slugDirs: string[];
  try {
    slugDirs = await fs.readdir(PROJECTS_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new ClaudeDataDirMissingError('~/.claude/projects/ not found — have you run Claude Code yet?');
    }
    throw err;
  }

  const projects: ProjectRecord[] = [];
  let totalSessions = 0;

  for (const slug of slugDirs) {
    const slugPath = path.join(PROJECTS_DIR, slug);
    let entries;
    try {
      entries = await fs.readdir(slugPath, { withFileTypes: true });
    } catch {
      continue;
    }

    const jsonlFiles = entries.filter(d => d.isFile() && d.name.endsWith('.jsonl'));
    if (jsonlFiles.length === 0) continue;

    const sessions: Session[] = [];

    for (const dirent of jsonlFiles) {
      const filePath = path.join(slugPath, dirent.name);
      const sessionId = dirent.name.replace(/\.jsonl$/, '');

      let stat;
      try {
        stat = await fs.stat(filePath);
      } catch {
        continue;
      }

      let parsed;
      try {
        parsed = await parseSessionFile(filePath);
      } catch {
        parsed = { messageCount: 0, description: '', tools: {}, firstTimestamp: null, lastTimestamp: null };
      }

      sessions.push({
        id: sessionId,
        projectSlug: slug,
        projectDisplay: decodeSlug(slug),
        filePath,
        timestamp: parsed.lastTimestamp ?? stat.mtime,
        messageCount: parsed.messageCount,
        description: parsed.description,
        tools: parsed.tools,
        isCurrent: currentSessionId !== null && sessionId === currentSessionId,
        sizeBytes: stat.size,
      });
    }

    sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    totalSessions += sessions.length;

    projects.push({
      slug,
      display: decodeSlug(slug),
      sessions,
    });
  }

  if (totalSessions === 0) {
    throw new NoSessionsFoundError('No sessions found');
  }

  projects.sort((a, b) => {
    const aLatest = a.sessions[0]?.timestamp.getTime() ?? 0;
    const bLatest = b.sessions[0]?.timestamp.getTime() ?? 0;
    return bLatest - aLatest;
  });

  return projects;
}

export function findSession(projects: ProjectRecord[], partial: string): Session[] {
  const matches: Session[] = [];
  for (const project of projects) {
    for (const session of project.sessions) {
      if (session.id === partial || session.id.includes(partial)) {
        matches.push(session);
      }
    }
  }
  return matches;
}
