import React from 'react';
import { Box, Text } from 'ink';

export function EmptyState(): React.JSX.Element {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="yellow">No sessions found.</Text>
      <Text dimColor>Have you run Claude Code yet? (~/.claude not found)</Text>
      <Text dimColor>Press q or Esc to exit.</Text>
    </Box>
  );
}
