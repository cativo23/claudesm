import React from 'react';
import { Box } from 'ink';
import type { ProjectRecord } from '../lib/types.js';
import { ProjectGroup } from './ProjectGroup.js';

interface Props {
  projects: ProjectRecord[];
  selectedIndex: number;
}

export function SessionList({ projects, selectedIndex }: Props): React.JSX.Element {
  let offset = 0;
  return (
    <Box flexDirection="column">
      {projects.map((project) => {
        const group = (
          <ProjectGroup
            key={project.slug}
            slug={project.slug}
            display={project.display}
            sessions={project.sessions}
            selectedIndex={selectedIndex}
            globalOffset={offset}
          />
        );
        offset += project.sessions.length;
        return group;
      })}
    </Box>
  );
}
