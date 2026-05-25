import fs from 'node:fs/promises';
import { CURRENT_SESSION_FILE } from '../paths.js';

export async function getCurrentSessionId(): Promise<string | null> {
  // Env var takes priority
  const envId = process.env['CLAUDE_SESSION_ID'];
  if (envId) {
    const trimmed = envId.trim();
    if (/^[0-9a-f-]{8,64}$/.test(trimmed)) return trimmed;
  }

  try {
    const content = await fs.readFile(CURRENT_SESSION_FILE, 'utf8');
    const trimmed = content.trim();
    if (!trimmed || !/^[0-9a-f-]{8,64}$/.test(trimmed)) return null;
    return trimmed;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    // Unreadable — warn but don't crash
    process.stderr.write(`Warning: could not read current-session file: ${(err as Error).message}\n`);
    return null;
  }
}
