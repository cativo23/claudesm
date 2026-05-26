import React from 'react';
import { Box, Text } from 'ink';

type Mode = 'list' | 'search' | 'action' | 'confirm' | 'help' | 'status';

interface Props {
  mode: Mode;
}

const HINTS: Record<Mode, string> = {
  list: '↑/↓ navigate  / search  Enter action  r resume  d delete  s status  ? help  q quit',
  search: 'type to filter  ↑/↓ navigate  Enter apply  Esc clear',
  action: 'r resume  d delete  c copy ID  Esc back',
  confirm: 'y confirm  n/Esc cancel',
  help: 'q/Esc close',
  status: 'q/Esc close',
};

export function StatusBar({ mode }: Props): React.JSX.Element {
  return (
    <Box borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} paddingX={1}>
      <Text dimColor>{HINTS[mode]}</Text>
    </Box>
  );
}
