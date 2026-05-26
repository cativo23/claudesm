import { existsSync } from 'node:fs';
import { hasTTY, isCI } from 'std-env';
import { render } from 'ink';
import React from 'react';
import { discoverSessions } from './lib/sessions/discover.js';
import { getCurrentSessionId } from './lib/sessions/current.js';
import { safeDelete } from './lib/fs-safe.js';
import { metaFilePath } from './lib/paths.js';
import type { Session } from './lib/types.js';

// Launch claude in the session's project directory. Runs only after Ink has
// unmounted so claude can take over the terminal cleanly.
async function launchClaude(id: string, cwd: string): Promise<void> {
  const dir = existsSync(cwd) ? cwd : process.cwd();
  if (dir !== cwd) {
    process.stderr.write(`Project directory not found: ${cwd}\nResuming in current directory instead.\n`);
  }
  const { execa } = await import('execa');
  try {
    await execa('claude', ['--resume', id], { cwd: dir, stdio: 'inherit' });
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { exitCode?: number };
    if (e.code === 'ENOENT') {
      process.stderr.write('`claude` not found in PATH. Install Claude Code from https://claude.ai/code\n');
      process.stdout.write(`\nRun: claude --resume ${id}\n`);
      return;
    }
    // claude exited non-zero (e.g. the user quit) — not a csm failure.
    if (typeof e.exitCode === 'number') return;
    throw err;
  }
}

export async function run(): Promise<void> {
  const canRenderTUI = hasTTY && !isCI;

  if (!canRenderTUI) {
    const { run: listRun } = await import('./commands/list.js');
    await listRun({});
    return;
  }

  // Lazy import Ink components (heavy, only loaded when TTY is available)
  const { App } = await import('./ui/App.js');

  const loadSessions = async () => {
    const currentId = await getCurrentSessionId();
    return discoverSessions(currentId);
  };

  // Deferred output — written after Ink unmounts to avoid corrupting raw-mode terminal
  let pendingOutput: string | null = null;
  // Deferred launch — claude takes over the terminal only after Ink has unmounted.
  // Cast keeps the union type through CFA (the value is only set inside onResume).
  let pendingResume = null as { id: string; cwd: string } | null;

  const onResume = (session: Session): void => {
    pendingResume = { id: session.id, cwd: session.cwd };
  };

  const onCopy = (session: Session): void => {
    pendingOutput = session.id + '\n';
  };

  const onDelete = async (session: Session): Promise<void> => {
    await safeDelete(session.filePath);
    await safeDelete(metaFilePath(session.id));
  };

  let pendingClean = false;
  const onClean = (): void => { pendingClean = true; };

  try {
    const { unmount, waitUntilExit } = render(
      React.createElement(App, { loadSessions, onResume, onCopy, onDelete, onClean })
    );
    await waitUntilExit();
    unmount();
    if (pendingOutput !== null) process.stdout.write(pendingOutput);
    if (pendingResume) {
      await launchClaude(pendingResume.id, pendingResume.cwd);
    }
    if (pendingClean) {
      const { run: cleanRun } = await import('./commands/clean.js');
      await cleanRun({ force: true });
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOTTY') {
      // WSL broken raw mode — fallback to list
      const { run: listRun } = await import('./commands/list.js');
      await listRun({});
    } else {
      throw err;
    }
  }
}
