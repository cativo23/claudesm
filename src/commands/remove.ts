import pc from 'picocolors';
import { discoverSessions } from '../lib/sessions/discover.js';
import { getCurrentSessionId } from '../lib/sessions/current.js';
import { safeDelete } from '../lib/fs-safe.js';
import { metaFilePath } from '../lib/paths.js';
import { printError } from '../lib/render.js';
import { findSession } from '../lib/sessions/discover.js';

export interface RemoveOpts {
  force?: boolean;
}

export async function run(id: string, opts: RemoveOpts): Promise<void> {
  if (!id) {
    printError('Usage: csm remove <session-id> [--force]');
    process.exit(1);
  }

  const currentId = await getCurrentSessionId();

  const projects = await discoverSessions(currentId);

  const matches = findSession(projects, id);

  if (matches.length === 0) {
    printError(`Session not found: ${id}`);
    process.exit(1);
  }

  if (matches.length > 1) {
    process.stderr.write(pc.red(`Ambiguous session ID "${id}" — ${matches.length} matches:\n`));
    for (const m of matches) {
      process.stderr.write(`  ${m.id}  ${m.description?.slice(0, 50) ?? ''}\n`);
    }
    process.stderr.write('Be more specific.\n');
    process.exit(8);
  }

  const session = matches[0]!;

  const shortId = session.id.slice(0, 8);

  if (session.isCurrent) {
    printError('Cannot remove current session. Exit Claude Code first.');
    process.exit(1);
  }

  if (!opts.force) {
    process.stderr.write(`Use ${pc.cyan('--force')} to confirm removal of session ${pc.cyan(shortId)}.\n`);
    process.exit(1);
  }

  await safeDelete(session.filePath);
  await safeDelete(metaFilePath(session.id));
  process.stdout.write(`${pc.green('✓')} Removed session: ${pc.cyan(shortId)}\n`);
}
