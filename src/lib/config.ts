import fs from 'node:fs/promises';
import path from 'node:path';
import { CONFIG_FILE, CONFIG_DIR } from './paths.js';
import type { ConfigData, ResolvedConfig, ConfigEntry, ConfigSource } from './types.js';
import { ConfigParseError } from './errors.js';

export const DEFAULTS: ConfigData = {
  version: 1,
  cleanDays: 7,
};

const CONFIG_KEYS = ['cleanDays'] as const;
type ConfigKey = typeof CONFIG_KEYS[number];

function fromEnv(): Partial<ConfigData> {
  const out: Partial<ConfigData> = {};
  const cleanDays = process.env['CSM_CLEAN_DAYS'];
  if (cleanDays !== undefined) {
    const n = Number(cleanDays);
    if (!isNaN(n)) out.cleanDays = n;
  }
  return out;
}

export async function loadRaw(): Promise<ConfigData> {
  try {
    const text = await fs.readFile(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(text) as ConfigData;
    return { ...DEFAULTS, ...parsed };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { ...DEFAULTS };
    }
    throw new ConfigParseError(`Failed to parse config at ${CONFIG_FILE}: ${(err as Error).message}`);
  }
}

export async function resolveConfig(): Promise<ResolvedConfig> {
  const env = fromEnv();

  let fileData: Partial<ConfigData> = {};
  try {
    const text = await fs.readFile(CONFIG_FILE, 'utf8');
    fileData = JSON.parse(text) as Partial<ConfigData>;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new ConfigParseError(`Failed to parse config at ${CONFIG_FILE}: ${(err as Error).message}`);
    }
  }

  function resolve<T>(key: ConfigKey, defaultValue: T): ConfigEntry<T> {
    if (key in env) return { value: env[key] as T, source: 'env' as ConfigSource };
    if (key in fileData) return { value: (fileData as Record<string, unknown>)[key] as T, source: 'file' as ConfigSource };
    return { value: defaultValue, source: 'default' as ConfigSource };
  }

  return {
    cleanDays: resolve('cleanDays', DEFAULTS.cleanDays),
  };
}

export async function saveConfig(data: Partial<ConfigData>): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  const current = await loadRaw();
  const next: ConfigData = { ...current, ...data };
  const content = JSON.stringify(next, null, 2) + '\n';
  const tmp = `${CONFIG_FILE}.${process.pid}.tmp`;

  await fs.writeFile(tmp, content, { mode: 0o600 });
  try {
    await fs.rename(tmp, CONFIG_FILE);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EBUSY') {
      // Windows antivirus lock — retry once after 100ms
      await new Promise(r => setTimeout(r, 100));
      try {
        await fs.rename(tmp, CONFIG_FILE);
      } catch {
        // Last resort: non-atomic copy (Windows only)
        await fs.copyFile(tmp, CONFIG_FILE);
        await fs.rm(tmp, { force: true });
      }
    } else {
      throw err;
    }
  }
}

export async function unsetConfigKey(key: ConfigKey): Promise<void> {
  const current = await loadRaw();
  const next = { ...current };
  delete (next as Record<string, unknown>)[key];
  await saveConfig(next);
}

export function parseConfigValue(key: ConfigKey, raw: string): number {
  const n = Number(raw);
  if (isNaN(n)) throw new Error(`${key} must be a number`);
  return n;
}

export { CONFIG_KEYS, type ConfigKey };
