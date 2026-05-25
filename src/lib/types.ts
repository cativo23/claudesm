export interface Session {
  id: string;
  projectSlug: string;
  projectDisplay: string;
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
  maxMessages: number;
  autoCleanEnabled: boolean;
  showTools: boolean;
}

export type ConfigSource = 'default' | 'file' | 'env';

export interface ConfigEntry<T> {
  value: T;
  source: ConfigSource;
}

export interface ResolvedConfig {
  cleanDays: ConfigEntry<number>;
  maxMessages: ConfigEntry<number>;
  autoCleanEnabled: ConfigEntry<boolean>;
  showTools: ConfigEntry<boolean>;
}
