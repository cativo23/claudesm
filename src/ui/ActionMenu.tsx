import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { Session } from '../lib/types.js';

export type SessionAction = 'resume' | 'delete' | 'copy' | 'back';

interface Props {
  session: Session;
  onAction: (action: SessionAction) => void;
}

export function ActionMenu({ session, onAction }: Props): React.JSX.Element {
  useInput((input, key) => {
    if (input === 'r') onAction('resume');
    else if (input === 'd') onAction('delete');
    else if (input === 'c') onAction('copy');
    else if (key.escape || input === 'q') onAction('back');
  });

  return (
    <Box flexDirection="column" borderStyle="round" padding={1} marginX={2}>
      <Text bold color="cyan">{session.id.slice(0, 8)} — {session.description?.slice(0, 50) || '(no description)'}</Text>
      <Text> </Text>
      <Text><Text color="green">r</Text> Resume session</Text>
      <Text><Text color="red">d</Text> Delete session</Text>
      <Text><Text color="cyan">c</Text> Copy ID to clipboard</Text>
      <Text><Text dimColor>Esc</Text> Back</Text>
    </Box>
  );
}
