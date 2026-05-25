import pc from 'picocolors';
import { discoverSessions } from '../lib/sessions/discover.js';
import { getCurrentSessionId } from '../lib/sessions/current.js';
import { formatBytes, printError } from '../lib/render.js';
import { CsmError } from '../lib/errors.js';

export interface StatusOpts {
  json?: boolean;
}

export async function run(opts: StatusOpts): Promise<void> {
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
  const totalMessages = allSessions.reduce((sum, s) => sum + s.messageCount, 0);
  const totalBytes = allSessions.reduce((sum, s) => sum + s.sizeBytes, 0);

  const sorted = [...allSessions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      projects: projects.length,
      sessions: allSessions.length,
      messages: totalMessages,
      diskBytes: totalBytes,
      oldestId: oldest?.id ?? null,
      newestId: newest?.id ?? null,
      currentId: currentId ?? null,
    }, null, 2) + '\n');
    return;
  }

  process.stdout.write(pc.bold(pc.cyan('\n  Claude Session Statistics\n\n')));
  const row = (label: string, value: string) =>
    process.stdout.write(`  ${pc.bold(pc.cyan(label.padEnd(18)))}${pc.white(value)}\n`);

  row('Projects:', `${projects.length}`);
  row('Total sessions:', `${allSessions.length}`);
  row('Total size:', formatBytes(totalBytes));
  row('Total messages:', `${totalMessages}`);

  if (oldest) {
    const ageDays = Math.floor((Date.now() - oldest.timestamp.getTime()) / 86_400_000);
    row('Oldest session:', `${oldest.id.slice(0, 8)} ${pc.dim(`(${ageDays}d ago)`)}`);
  }
  if (newest) {
    const ageDays = Math.floor((Date.now() - newest.timestamp.getTime()) / 86_400_000);
    row('Newest session:', `${newest.id.slice(0, 8)} ${pc.dim(`(${ageDays}d ago)`)}`);
  }
  if (currentId) {
    process.stdout.write('\n');
    row('Current session:', pc.green(currentId.slice(0, 8)));
  }
  process.stdout.write('\n');
}
