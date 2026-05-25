import React from 'react';
import { Box, Text, useInput } from 'ink';

interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({ message, confirmLabel = 'confirm', onConfirm, onCancel }: Props): React.JSX.Element {
  useInput((input, key) => {
    if (input === 'y' || input === 'Y') void onConfirm();
    else if (input === 'n' || input === 'N' || key.escape) onCancel();
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="red" padding={1} marginX={2}>
      <Text color="red">{message}</Text>
      <Text> </Text>
      <Text><Text color="green">y</Text> Yes, {confirmLabel}  <Text dimColor>n/Esc</Text> Cancel</Text>
    </Box>
  );
}
