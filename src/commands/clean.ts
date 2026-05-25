import pc from 'picocolors';
import { discoverSessions } from '../lib/sessions/discover.js';
import { getCurrentSessionId } from '../lib/sessions/current.js';
import { resolveConfig } from '../lib/config.js';
import { safeDelete } from '../lib/fs-safe.js';
import { metaFilePath } from '../lib/paths.js';
import { formatBytes, printError, printInfo } from '../lib/render.js';
import { CsmError } from '../lib/errors.js';

export interface CleanOpts {
  days?: number;
  force?: boolean;
  dryRun?: boolean;
}

export async function run(opts: CleanOpts): Promise<void> {
  const config = await resolveConfig();
  const days = opts.days ?? config.cleanDays.value;
  const force = opts.force ?? false;
  const dryRun = opts.dryRun ?? false;

  const currentId = await getCurrentSessionId();

  let projects;
  try {
    projects = await discoverSessions(currentId);
  } catch (err) {
    if (err instanceof CsmError) {
      printError(err.message);
      process.exit(err.exitCode);
    }
    throw err;
  }

  const allSessions = projects.flatMap(p => p.sessions);
  const now = Date.now();

  const candidates = allSessions.filter(s => {
    if (s.isCurrent) return false;
    const ageDays = Math.floor((now - s.timestamp.getTime()) / 86_400_000);
    return ageDays >= days;
  });

  if (candidates.length === 0) {
    printInfo(`No sessions older than ${days} days found.`);
    return;
  }

  printInfo(`${dryRun ? '[Dry run] ' : ''}Cleaning sessions older than ${days} days...`);

  let removed = 0;
  let skipped = 0;

  for (const session of candidates) {
    const ageDays = Math.floor((now - session.timestamp.getTime()) / 86_400_000);
    const shortId = session.id.slice(0, 8);

    if (dryRun) {
      process.stdout.write(`  Would remove: ${pc.cyan(shortId)} (${ageDays}d old, ${formatBytes(session.sizeBytes)})\n`);
      removed++;
      continue;
    }

    if (!force) {
      // In CLI non-interactive mode, require --force
      process.stdout.write(`  Skipping ${pc.cyan(shortId)} — use --force to delete without prompting\n`);
      skipped++;
      continue;
    }

    await safeDelete(session.filePath);
    await safeDelete(metaFilePath(session.id));
    process.stdout.write(`  ${pc.green('✓')} Removed: ${pc.cyan(shortId)} (${ageDays}d, ${formatBytes(session.sizeBytes)})\n`);
    removed++;
  }

  process.stdout.write('\n');
  if (dryRun) {
    process.stdout.write(`${pc.cyan('Dry run complete.')} ${removed} session(s) would be removed.\n`);
  } else {
    process.stdout.write(
      `${pc.bold('Summary:')} removed ${pc.red(String(removed))}, skipped ${pc.green(String(skipped))}\n`
    );
  }
}
