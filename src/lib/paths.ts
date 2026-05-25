import os from 'node:os';
import path from 'node:path';
import envPaths from 'env-paths';

const paths = envPaths('claudesm', { suffix: '' });

export const CLAUDE_DIR = path.join(os.homedir(), '.claude');
export const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');
export const META_DIR = path.join(CLAUDE_DIR, 'usage-data', 'session-meta');
export const CURRENT_SESSION_FILE = path.join(CLAUDE_DIR, 'current-session');

const configBase = process.env['CSM_CONFIG_DIR'] ?? paths.config;
export const CONFIG_DIR = configBase;
export const CONFIG_FILE = path.join(configBase, 'config.json');
export const LAST_CLEAN_FILE = path.join(configBase, 'last-clean');

export function metaFilePath(sessionId: string): string {
  return path.join(META_DIR, `${sessionId}.json`);
}

export function decodeSlug(slug: string): string {
  // Slug format: leading '-' then path components joined with '-'
  // e.g. '-home-carlos-projects-myapp' → '/home/carlos/projects/myapp'
  // Lossy (ambiguous for paths containing '-') — for display only, never for fs ops
  return slug.replace(/^-/, '/').replace(/-/g, '/');
}
