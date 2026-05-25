import React from 'react';
import { Box, Text } from 'ink';
import type { Session } from '../lib/types.js';
import { formatDate, formatBytes, truncate, formatToolsLine } from '../lib/render.js';

interface Props {
  session: Session;
  isSelected: boolean;
}

export function SessionRow({ session, isSelected }: Props): React.JSX.Element {
  const ageDays = Math.floor((Date.now() - session.timestamp.getTime()) / 86_400_000);
  const ageColor = ageDays > 7 ? 'yellow' : undefined;
  const shortId = session.id.slice(0, 8);
  const desc = truncate(session.description || '(no description)', 40);
  const toolsStr = formatToolsLine(session.tools);

  return (
    <Box paddingX={1}>
      <Text>{isSelected ? '▶ ' : '  '}</Text>
      <Text color={session.isCurrent ? 'green' : 'cyan'} bold={session.isCurrent}>
        {shortId.padEnd(10)}
      </Text>
      <Text dimColor>{formatBytes(session.sizeBytes).padEnd(8)}</Text>
      <Text dimColor={!isSelected}>{desc.padEnd(42)}</Text>
      {toolsStr ? <Text dimColor>{toolsStr.padEnd(20)}</Text> : <Text>{' '.repeat(20)}</Text>}
      {ageColor
        ? <Text color={ageColor}>{`[${ageDays}d]`}</Text>
        : <Text dimColor>{`[${ageDays}d]`}</Text>}
    </Box>
  );
}
