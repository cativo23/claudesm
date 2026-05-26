export interface Session {
  id: string;
  projectSlug: string;
  projectDisplay: string;
  cwd: string;
  filePath: string;
  timestamp: Date;
  messageCount: number;
  description: string;
  tools: Record<string, number>;
  isCurrent: boolean;
  sizeBytes: number;
}

export interface ProjectRecord {
  slug: string;
  display: string;
  sessions: Session[];
}

export interface ListJsonOutput {
  projects: ProjectRecord[];
}

export interface ConfigData {
  $schema?: string;
  version: number;
  cleanDays: number;
}

export type ConfigSource = 'default' | 'file' | 'env';

export interface ConfigEntry<T> {
  value: T;
  source: ConfigSource;
}

export interface ResolvedConfig {
  cleanDays: ConfigEntry<number>;
}
