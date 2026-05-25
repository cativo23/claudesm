import pc from 'picocolors';
import { discoverSessions, findSession } from '../lib/sessions/discover.js';
import { getCurrentSessionId } from '../lib/sessions/current.js';
import { printError } from '../lib/render.js';

export interface ResumeOpts {
  spawn?: boolean;
}

export async function run(id: string, opts: ResumeOpts): Promise<void> {
  if (!id) {
    printError('Usage: csm resume <session-id> [--spawn]');
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

  if (opts.spawn) {
    // Spawn claude --resume <id> with inherited stdio
    const { execa } = await import('execa');
    try {
      await execa('claude', ['--resume', session.id], { stdio: 'inherit' });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        printError('`claude` not found in PATH. Install Claude Code from https://claude.ai/code');
        process.exit(3);
      }
      throw err;
    }
  } else {
    // Default: print the command for the user to copy (preserves bash behavior)
    process.stdout.write('\n');
    process.stdout.write(`  ${pc.bold('Resume session:')} ${session.id.slice(0, 8)}\n`);
    if (session.description) {
      process.stdout.write(`  ${pc.dim(session.description.slice(0, 60))}\n`);
    }
    process.stdout.write('\n');
    process.stdout.write(`  Run: ${pc.cyan(`claude --resume ${session.id}`)}\n`);
    process.stdout.write('\n');
  }
}
