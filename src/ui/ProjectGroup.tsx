import React from 'react';
import { Box, Text } from 'ink';
import type { Session } from '../lib/types.js';
import { SessionRow } from './SessionRow.js';
import { truncate } from '../lib/render.js';

interface Props {
  slug: string;
  display: string;
  sessions: Session[];
  selectedIndex: number;
  globalOffset: number;
}

export function ProjectGroup({ display, sessions, selectedIndex, globalOffset }: Props): React.JSX.Element {
  return (
    <Box flexDirection="column">
      <Box paddingX={1}>
        <Text color="cyan" bold>{truncate(display, 60)}</Text>
      </Box>
      {sessions.map((session, i) => (
        <SessionRow
          key={session.id}
          session={session}
          isSelected={selectedIndex === globalOffset + i}
        />
      ))}
    </Box>
  );
}
