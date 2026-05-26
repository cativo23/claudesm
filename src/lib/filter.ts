import type { ProjectRecord, Session } from './types.js';

export function matchSession(session: Session, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${session.id} ${session.projectDisplay} ${session.description}`.toLowerCase();
  return q.split(/\s+/).every(token => haystack.includes(token));
}

export function filterProjects(projects: ProjectRecord[], query: string): ProjectRecord[] {
  if (!query.trim()) return projects;
  const out: ProjectRecord[] = [];
  for (const project of projects) {
    const sessions = project.sessions.filter(s => matchSession(s, query));
    if (sessions.length > 0) out.push({ ...project, sessions });
  }
  return out;
}
