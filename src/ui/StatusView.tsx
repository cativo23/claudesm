import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { ProjectRecord } from '../lib/types.js';
import { formatBytes } from '../lib/render.js';

interface Props {
  projects: ProjectRecord[];
  onClose: () => void;
}

export function StatusView({ projects, onClose }: Props): React.JSX.Element {
  useInput((input, key) => {
    if (input === 'q' || input === 's' || key.escape) onClose();
  });

  const totalSessions = projects.reduce((sum, p) => sum + p.sessions.length, 0);
  const totalMessages = projects.reduce((sum, p) =>
    sum + p.sessions.reduce((s, sess) => s + sess.messageCount, 0), 0);
  const totalBytes = projects.reduce((sum, p) =>
    sum + p.sessions.reduce((s, sess) => s + sess.sizeBytes, 0), 0);

  return (
    <Box flexDirection="column" borderStyle="round" padding={1} marginX={2}>
      <Text bold color="cyan">Session Status</Text>
      <Text> </Text>
      <Text>Projects:  <Text color="green">{projects.length}</Text></Text>
      <Text>Sessions:  <Text color="green">{totalSessions}</Text></Text>
      <Text>Messages:  <Text color="green">{totalMessages}</Text></Text>
      <Text>Disk:      <Text color="green">{formatBytes(totalBytes)}</Text></Text>
      <Text> </Text>
      <Text dimColor>q/Esc to close</Text>
    </Box>
  );
}
