import React from 'react';
import { Box, Text, useInput } from 'ink';

interface Props {
  onClose: () => void;
}

const BINDINGS = [
  ['↑/↓', 'Navigate sessions'],
  ['Enter', 'Open action menu'],
  ['r', 'Resume selected session'],
  ['d', 'Delete selected session'],
  ['c', 'Run clean (remove old sessions)'],
  ['s', 'Toggle status view'],
  ['?', 'Toggle this help'],
  ['q/Esc', 'Quit'],
] as const;

export function HelpOverlay({ onClose }: Props): React.JSX.Element {
  useInput((input, key) => {
    if (input === 'q' || input === '?' || key.escape) onClose();
  });

  return (
    <Box flexDirection="column" borderStyle="round" padding={1} marginX={2}>
      <Text bold color="cyan">Keybindings</Text>
      <Text> </Text>
      {BINDINGS.map(([key, desc]) => (
        <Box key={key}>
          <Text color="green">{key.padEnd(10)}</Text>
          <Text dimColor>{desc}</Text>
        </Box>
      ))}
    </Box>
  );
}
