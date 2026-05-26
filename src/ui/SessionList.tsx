import React from 'react';
import { Box, Text } from 'ink';
import type { ProjectRecord } from '../lib/types.js';
import { SessionRow } from './SessionRow.js';
import { truncate } from '../lib/render.js';
import { buildRows, computeWindow, selectedRowIndex } from '../lib/viewport.js';

interface Props {
  projects: ProjectRecord[];
  selectedIndex: number;
  viewportRows: number;
}

export function SessionList({ projects, selectedIndex, viewportRows }: Props): React.JSX.Element {
  const rows = buildRows(projects);
  const selectedRow = selectedRowIndex(rows, selectedIndex);
  const { start, end } = computeWindow(rows.length, Math.max(0, selectedRow), viewportRows);
  const visible = rows.slice(start, end);

  return (
    <Box flexDirection="column">
      {visible.map((row) =>
        row.kind === 'header' ? (
          <Box key={`h:${row.slug}`} paddingX={1}>
            <Text color="cyan" bold>{truncate(row.display, 60)}</Text>
          </Box>
        ) : (
          <SessionRow
            key={row.session.id}
            session={row.session}
            isSelected={row.index === selectedIndex}
          />
        )
      )}
    </Box>
  );
}
