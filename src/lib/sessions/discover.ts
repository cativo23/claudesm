import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECTS_DIR, decodeSlug } from '../paths.js';
import { parseSessionFile } from './parse.js';
import { ClaudeDataDirMissingError, NoSessionsFoundError } from '../errors.js';
import type { Session, ProjectRecord } from '../types.js';

export async function discoverSessions(currentSessionId: string | null): Promise<ProjectRecord[]> {
  let slugDirents: import('node:fs').Dirent[];
  try {
    slugDirents = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new ClaudeDataDirMissingError('~/.claude/projects/ not found — have you run Claude Code yet?');
    }
    throw err;
  }

  const projectResults = await Promise.all(slugDirents.map(async (slugDirent) => {
    // Only descend into actual directories — skip symlinks, files, and path traversal
    if (!slugDirent.isDirectory()) return null;
    const slug = slugDirent.name;
    // Guard against path traversal via crafted slug names
    const slugPath = path.resolve(PROJECTS_DIR, slug);
    if (!slugPath.startsWith(path.resolve(PROJECTS_DIR) + path.sep)) return null;

    let entries;
    try {
      entries = await fs.readdir(slugPath, { withFileTypes: true });
    } catch {
      return null;
    }

    const jsonlFiles = entries.filter(d => d.isFile() && d.name.endsWith('.jsonl'));
    if (jsonlFiles.length === 0) return null;

    const settled = await Promise.all(jsonlFiles.map(async (dirent): Promise<Session | null> => {
      const filePath = path.join(slugPath, dirent.name);
      const sessionId = dirent.name.replace(/\.jsonl$/, '');

      let stat;
      try {
        stat = await fs.stat(filePath);
      } catch {
        return null;
      }

      let parsed;
      try {
        parsed = await parseSessionFile(filePath);
      } catch {
        parsed = { messageCount: 0, description: '', tools: {}, firstTimestamp: null, lastTimestamp: null };
      }

      return {
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
      };
    }));

    const sessions = settled.filter((s): s is Session => s !== null);
    if (sessions.length === 0) return null;
    sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return { slug, display: decodeSlug(slug), sessions };
  }));

  const projects = projectResults.filter((p): p is ProjectRecord => p !== null);

  if (projects.length === 0) {
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
