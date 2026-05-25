import fs from 'node:fs/promises';

export interface DeleteOptions {
  dryRun?: boolean;
}

export async function safeDelete(filePath: string, opts: DeleteOptions = {}): Promise<boolean> {
  if (opts.dryRun) {
    return true;
  }
  try {
    await fs.rm(filePath, { force: true });
    return true;
  } catch {
    return false;
  }
}

export async function safeDeleteDir(dirPath: string, opts: DeleteOptions = {}): Promise<boolean> {
  if (opts.dryRun) {
    return true;
  }
  try {
    await fs.rm(dirPath, { force: true, recursive: true });
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true, mode: 0o700 });
}
