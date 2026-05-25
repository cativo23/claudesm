import pc from 'picocolors';
import { discoverSessions } from '../lib/sessions/discover.js';
import { getCurrentSessionId } from '../lib/sessions/current.js';
import { formatBytes, formatDate, truncate, formatToolsLine } from '../lib/render.js';
import type { ListJsonOutput, Session } from '../lib/types.js';

export interface ListOpts {
  all?: boolean;
  current?: boolean;
  json?: boolean;
}

export async function run(opts: ListOpts): Promise<void> {
  const currentId = await getCurrentSessionId();

  let projects = await discoverSessions(currentId);

  // --current: show only the current session
  if (opts.current) {
    if (!currentId) {
      process.stderr.write('No current session\n');
      process.exit(0);
    }
    const allSessions = projects.flatMap(p => p.sessions);
    const current = allSessions.find(s => s.id === currentId);
    if (!current) {
      process.stderr.write('No current session\n');
      process.exit(0);
    }
    projects = projects.map(p => ({
      ...p,
      sessions: p.sessions.filter(s => s.id === currentId),
    })).filter(p => p.sessions.length > 0);
  }

  // --json output
  if (opts.json) {
    const out: ListJsonOutput = { projects };
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }

  // Table header
  const header = [
    pc.bold(pc.gray('  ID'.padEnd(12))),
    pc.bold(pc.gray('SIZE'.padEnd(8))),
    pc.bold(pc.gray('AGE'.padEnd(8))),
    pc.bold(pc.gray('DESCRIPTION'.padEnd(44))),
    pc.bold(pc.gray('TOOLS')),
  ].join('');
  const divider = pc.gray(' ' + '─'.repeat(78));

  process.stdout.write(header + '\n');
  process.stdout.write(divider + '\n');

  let total = 0;

  for (const project of projects) {
    let projectHeaderPrinted = false;

    for (const session of project.sessions) {
      if (!opts.all && !opts.current && session.projectSlug.startsWith('.')) continue;
      if (!projectHeaderPrinted) {
        process.stdout.write(pc.cyan(pc.bold(`  ${project.display}\n`)));
        projectHeaderPrinted = true;
      }

      const shortId = session.id.slice(0, 8);
      const ageDays = Math.floor((Date.now() - session.timestamp.getTime()) / 86_400_000);
      const ageStr = `${ageDays}d`;
      const desc = truncate(session.description || '(no description)', 42);
      const tools = formatToolsLine(session.tools);
      const marker = session.isCurrent ? pc.green('▶ ') : '  ';
      const idStr = session.isCurrent
        ? pc.green(pc.bold(shortId.padEnd(10)))
        : pc.cyan(shortId.padEnd(10));
      const ageColored = ageDays > 7 ? pc.yellow(ageStr.padEnd(6)) : pc.dim(ageStr.padEnd(6));

      const line = [
        marker + idStr,
        pc.white(formatBytes(session.sizeBytes).padEnd(8)),
        ageColored,
        pc.dim(desc.padEnd(44)),
        pc.white(tools),
      ].join('');

      process.stdout.write(line + '\n');
      total++;
    }
  }

  process.stdout.write(divider + '\n');
  process.stdout.write(`Total: ${total} session(s)\n`);
  if (currentId) {
    process.stdout.write(`Current: ${pc.green(currentId.slice(0, 8))}\n`);
  }
}
