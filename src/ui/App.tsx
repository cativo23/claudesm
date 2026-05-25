import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
// Simple inline spinner — ink-spinner is not bundled with ink 7
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
function Spinner(): React.JSX.Element {
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(id);
  }, []);
  return <Text color="cyan">{SPINNER_FRAMES[frame]}</Text>;
}
import type { ProjectRecord, Session } from '../lib/types.js';
import { SessionList } from './SessionList.js';
import { ActionMenu, type SessionAction } from './ActionMenu.js';
import { ConfirmDialog } from './ConfirmDialog.js';
import { HelpOverlay } from './HelpOverlay.js';
import { StatusView } from './StatusView.js';
import { StatusBar } from './StatusBar.js';
import { EmptyState } from './EmptyState.js';

type Mode = 'list' | 'action' | 'confirm' | 'help' | 'status';

interface Props {
  loadSessions: () => Promise<ProjectRecord[]>;
  onResume: (session: Session) => void;
  onDelete: (session: Session) => Promise<void>;
  onClean: () => Promise<void>;
}

function flatSessions(projects: ProjectRecord[]): Session[] {
  return projects.flatMap(p => p.sessions);
}

export function App({ loadSessions, onResume, onDelete, onClean }: Props): React.JSX.Element {
  const { exit } = useApp();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('list');

  useEffect(() => {
    loadSessions()
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadSessions]);

  const sessions = flatSessions(projects);
  const selectedSession = sessions[selectedIndex] ?? null;

  useInput((input, key) => {
    if (mode !== 'list') return;
    if (key.upArrow) setSelectedIndex(i => Math.max(0, i - 1));
    else if (key.downArrow) setSelectedIndex(i => Math.min(sessions.length - 1, i + 1));
    else if (key.return && selectedSession) setMode('action');
    else if (input === 'r' && selectedSession) { onResume(selectedSession); exit(); }
    else if (input === 'd' && selectedSession) setMode('confirm');
    else if (input === 'c') { onClean().catch(() => {}); }
    else if (input === 's') setMode('status');
    else if (input === '?') setMode('help');
    else if (input === 'q' || key.escape) exit();
  });

  const handleAction = (action: SessionAction) => {
    if (action === 'resume' && selectedSession) { onResume(selectedSession); exit(); }
    else if (action === 'delete') setMode('confirm');
    else if (action === 'copy' && selectedSession) {
      // Best-effort clipboard copy
      process.stdout.write(selectedSession.id);
      exit();
    }
    else if (action === 'back') setMode('list');
  };

  const handleConfirm = async () => {
    if (!selectedSession) return;
    await onDelete(selectedSession);
    setProjects(await loadSessions().catch(() => []));
    setSelectedIndex(i => Math.min(i, flatSessions(projects).length - 2));
    setMode('list');
  };

  if (loading) {
    return (
      <Box padding={1}>
        <Spinner />
        <Text> Loading sessions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
        <Text dimColor>Have you run Claude Code yet?</Text>
      </Box>
    );
  }

  if (sessions.length === 0) return <EmptyState />;

  return (
    <Box flexDirection="column">
      <Box paddingX={1} paddingY={0}>
        <Text bold color="cyan">csm </Text>
        <Text dimColor>— Claude Session Manager</Text>
      </Box>

      {mode === 'help' && <HelpOverlay onClose={() => setMode('list')} />}
      {mode === 'status' && <StatusView projects={projects} onClose={() => setMode('list')} />}
      {mode === 'action' && selectedSession && (
        <ActionMenu session={selectedSession} onAction={handleAction} />
      )}
      {mode === 'confirm' && selectedSession && (
        <ConfirmDialog
          message={`Delete session ${selectedSession.id.slice(0, 8)}? This cannot be undone.`}
          onConfirm={handleConfirm}
          onCancel={() => setMode('action')}
        />
      )}
      {(mode === 'list') && (
        <SessionList projects={projects} selectedIndex={selectedIndex} />
      )}

      <StatusBar mode={mode} />
    </Box>
  );
}
