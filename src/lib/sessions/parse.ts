import fs from 'node:fs';
import readline from 'node:readline';

interface ParsedSession {
  messageCount: number;
  description: string;
  tools: Record<string, number>;
  firstTimestamp: Date | null;
  lastTimestamp: Date | null;
}

interface RawEntry {
  type: string;
  message?: {
    content?: Array<{ type: string; text?: string; name?: string }>;
  };
  timestamp?: string;
}

export async function parseSessionFile(filePath: string): Promise<ParsedSession> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    let messageCount = 0;
    let description = '';
    const tools: Record<string, number> = {};
    let firstTimestamp: Date | null = null;
    let lastTimestamp: Date | null = null;

    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let entry: RawEntry;
      try {
        entry = JSON.parse(trimmed) as RawEntry;
      } catch {
        return; // skip corrupted lines
      }

      const ts = entry.timestamp ? new Date(entry.timestamp) : null;
      if (ts && !isNaN(ts.getTime())) {
        if (!firstTimestamp) firstTimestamp = ts;
        lastTimestamp = ts;
      }

      if (entry.type === 'user' || entry.type === 'assistant') {
        messageCount++;
      }

      if (entry.type === 'user' && !description) {
        const blocks = entry.message?.content ?? [];
        for (const block of blocks) {
          if (block.type === 'text' && block.text) {
            description = block.text.trim().slice(0, 200);
            break;
          }
        }
      }

      if (entry.type === 'assistant') {
        const blocks = entry.message?.content ?? [];
        for (const block of blocks) {
          if (block.type === 'tool_use' && block.name) {
            tools[block.name] = (tools[block.name] ?? 0) + 1;
          }
        }
      }
    });

    rl.on('close', () => resolve({ messageCount, description, tools, firstTimestamp, lastTimestamp }));
    rl.on('error', reject);
  });
}
