import pc from 'picocolors';

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toISOString().slice(0, 10);
}

export function formatAgeDays(date: Date): number {
  const diffMs = Date.now() - date.getTime();
  return Math.floor(diffMs / 86_400_000);
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

export function formatToolsLine(tools: Record<string, number>): string {
  return Object.entries(tools)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => `${name}×${count}`)
    .join(' ');
}

export function printError(message: string): void {
  process.stderr.write(pc.red(`Error: ${message}\n`));
}

export function printWarning(message: string): void {
  process.stderr.write(pc.yellow(`Warning: ${message}\n`));
}

export function printInfo(message: string): void {
  process.stdout.write(`${message}\n`);
}
