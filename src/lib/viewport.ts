import type { ProjectRecord, Session } from './types.js';

export type Row =
  | { kind: 'header'; display: string; slug: string }
  | { kind: 'session'; session: Session; index: number };

export function buildRows(projects: ProjectRecord[]): Row[] {
  const rows: Row[] = [];
  let index = 0;
  for (const project of projects) {
    rows.push({ kind: 'header', display: project.display, slug: project.slug });
    for (const session of project.sessions) {
      rows.push({ kind: 'session', session, index });
      index += 1;
    }
  }
  return rows;
}

export function selectedRowIndex(rows: Row[], sessionIndex: number): number {
  return rows.findIndex(r => r.kind === 'session' && r.index === sessionIndex);
}

export interface Window {
  start: number;
  end: number;
}

// Centered, stateless scroll: keeps `selected` inside the window, clamped to bounds.
export function computeWindow(total: number, selected: number, height: number): Window {
  if (height <= 0) return { start: 0, end: 0 };
  const size = Math.min(height, total);
  if (total <= height) return { start: 0, end: total };
  let start = selected - Math.floor(size / 2);
  if (start < 0) start = 0;
  if (start + size > total) start = total - size;
  return { start, end: start + size };
}
