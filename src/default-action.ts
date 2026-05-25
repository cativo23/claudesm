import { hasTTY, isCI } from 'std-env';
import { render } from 'ink';
import React from 'react';
import { discoverSessions } from './lib/sessions/discover.js';
import { getCurrentSessionId } from './lib/sessions/current.js';
import { safeDelete } from './lib/fs-safe.js';
import { metaFilePath } from './lib/paths.js';
import type { Session } from './lib/types.js';

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

  const onResume = (session: Session): void => {
    process.stdout.write(`\nRun: claude --resume ${session.id}\n`);
  };

  const onDelete = async (session: Session): Promise<void> => {
    await safeDelete(session.filePath);
    await safeDelete(metaFilePath(session.id));
  };

  const onClean = async (): Promise<void> => {
    const { run: cleanRun } = await import('./commands/clean.js');
    await cleanRun({ force: true });
  };

  try {
    const { unmount, waitUntilExit } = render(
      React.createElement(App, { loadSessions, onResume, onDelete, onClean })
    );
    await waitUntilExit();
    unmount();
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
