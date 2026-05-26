import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import type { ProjectRecord, Session } from '../lib/types.js';
import { SessionList } from './SessionList.js';
import { ActionMenu, type SessionAction } from './ActionMenu.js';
import { ConfirmDialog } from './ConfirmDialog.js';
import { HelpOverlay } from './HelpOverlay.js';
import { StatusView } from './StatusView.js';
import { StatusBar } from './StatusBar.js';
import { EmptyState } from './EmptyState.js';
import { filterProjects } from '../lib/filter.js';

// ink-spinner is not bundled with ink 7 — inline minimal spinner
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
function Spinner(): React.JSX.Element {
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(id);
  }, []);
  return <Text color="cyan">{SPINNER_FRAMES[frame]}</Text>;
}

type Mode = 'list' | 'search' | 'action' | 'confirm' | 'help' | 'status';

interface Props {
  loadSessions: () => Promise<ProjectRecord[]>;
  onResume: (session: Session) => void;
  onCopy: (session: Session) => void;
  onDelete: (session: Session) => Promise<void>;
  onClean: () => void;
}

function flatSessions(projects: ProjectRecord[]): Session[] {
  return projects.flatMap(p => p.sessions);
}

// Terminal row count, kept current on resize. Falls back to 24 when unknown.
function useTerminalRows(): number {
  const { stdout } = useStdout();
  const [rows, setRows] = useState(stdout?.rows ?? 24);
  useEffect(() => {
    if (!stdout || typeof stdout.on !== 'function') return;
    const onResize = () => setRows(stdout.rows ?? 24);
    stdout.on('resize', onResize);
    return () => { stdout.off('resize', onResize); };
  }, [stdout]);
  return rows;
}

// Rows consumed by chrome: title (1), info line (1), status bar (2). Leave a margin.
const CHROME_ROWS = 5;

export function App({ loadSessions, onResume, onCopy, onDelete, onClean }: Props): React.JSX.Element {
  const { exit } = useApp();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('list');
  const [pendingClean, setPendingClean] = useState(false);
  const [query, setQuery] = useState('');
  const terminalRows = useTerminalRows();

  useEffect(() => {
    loadSessions()
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadSessions]);

  const filtered = filterProjects(projects, query);
  const sessions = flatSessions(filtered);
  // Clamp selection to the filtered range so a shrinking list never strands the cursor.
  const safeIndex = Math.min(selectedIndex, Math.max(0, sessions.length - 1));
  const selectedSession = sessions[safeIndex] ?? null;
  const viewportRows = Math.max(3, terminalRows - CHROME_ROWS);

  useInput((input, key) => {
    if (mode === 'search') {
      if (key.return) setMode('list');
      else if (key.escape) { setQuery(''); setSelectedIndex(0); setMode('list'); }
      else if (key.backspace || key.delete) { setQuery(q => q.slice(0, -1)); setSelectedIndex(0); }
      else if (key.upArrow) setSelectedIndex(i => Math.max(0, i - 1));
      else if (key.downArrow) setSelectedIndex(i => Math.min(sessions.length - 1, i + 1));
      else if (input && !key.ctrl && !key.meta && input >= ' ') { setQuery(q => q + input); setSelectedIndex(0); }
      return;
    }
    if (mode !== 'list') return;
    if (key.upArrow || input === 'k') setSelectedIndex(i => Math.max(0, i - 1));
    else if (key.downArrow || input === 'j') setSelectedIndex(i => Math.min(sessions.length - 1, i + 1));
    else if (input === '/') setMode('search');
    else if (key.return && selectedSession) setMode('action');
    else if (input === 'r' && selectedSession) { onResume(selectedSession); exit(); }
    else if (input === 'd' && selectedSession) setMode('confirm');
    else if (input === 'c') { setPendingClean(true); setMode('confirm'); }
    else if (input === 's') setMode('status');
    else if (input === '?') setMode('help');
    else if (key.escape && query) { setQuery(''); setSelectedIndex(0); }
    else if (input === 'q' || key.escape) exit();
  });

  const handleAction = (action: SessionAction) => {
    if (action === 'resume' && selectedSession) { onResume(selectedSession); exit(); }
    else if (action === 'delete') setMode('confirm');
    else if (action === 'copy' && selectedSession) {
      onCopy(selectedSession);
      exit();
    }
    else if (action === 'back') setMode('list');
  };

  const handleConfirm = async () => {
    if (pendingClean) {
      setPendingClean(false);
      onClean();  // signals intent; runs after Ink unmounts in default-action.ts
      exit();
      return;
    }
    try {
      if (selectedSession) await onDelete(selectedSession);
      const fresh = await loadSessions().catch(() => [] as ProjectRecord[]);
      setProjects(fresh);
      setSelectedIndex(i => Math.min(i, Math.max(0, flatSessions(fresh).length - 1)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setMode('list');
    }
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

  const total = flatSessions(projects).length;
  if (total === 0) return <EmptyState />;

  const searching = mode === 'search';
  const noMatches = sessions.length === 0;

  return (
    <Box flexDirection="column">
      <Box paddingX={1} paddingY={0}>
        <Text bold color="cyan">csm </Text>
        <Text dimColor>— Claude Session Manager</Text>
      </Box>

      <Box paddingX={1}>
        {searching || query ? (
          <Text>
            <Text color="cyan">Filter: </Text>
            <Text>{query}</Text>
            {searching && <Text color="cyan">▏</Text>}
            <Text dimColor>{`  ·  ${sessions.length}/${total}`}</Text>
          </Text>
        ) : (
          <Text dimColor>
            {`${total} sessions`}
            {selectedSession ? `  ·  ${selectedSession.projectDisplay}` : ''}
          </Text>
        )}
      </Box>

      {mode === 'help' && <HelpOverlay onClose={() => setMode('list')} />}
      {mode === 'status' && <StatusView projects={projects} onClose={() => setMode('list')} />}
      {mode === 'action' && selectedSession && (
        <ActionMenu session={selectedSession} onAction={handleAction} />
      )}
      {mode === 'confirm' && (pendingClean || selectedSession) && (
        <ConfirmDialog
          message={pendingClean
            ? 'Clean all sessions older than threshold? This cannot be undone.'
            : `Delete session ${selectedSession!.id.slice(0, 8)}? This cannot be undone.`}
          confirmLabel={pendingClean ? 'clean' : 'delete'}
          onConfirm={handleConfirm}
          onCancel={() => { setPendingClean(false); setMode(pendingClean ? 'list' : 'action'); }}
        />
      )}
      {(mode === 'list' || mode === 'search') && (
        noMatches
          ? <Box paddingX={1}><Text dimColor>No sessions match — Esc to clear.</Text></Box>
          : <SessionList projects={filtered} selectedIndex={safeIndex} viewportRows={viewportRows} />
      )}

      <StatusBar mode={mode} />
    </Box>
  );
}
