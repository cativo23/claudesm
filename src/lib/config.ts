import fs from 'node:fs/promises';
import path from 'node:path';
import { CONFIG_FILE, CONFIG_DIR } from './paths.js';
import type { ConfigData, ResolvedConfig, ConfigEntry, ConfigSource } from './types.js';
import { ConfigParseError } from './errors.js';

export const DEFAULTS: ConfigData = {
  version: 1,
  cleanDays: 7,
  maxMessages: 500,
  autoCleanEnabled: true,
  showTools: true,
};

const CONFIG_KEYS = ['cleanDays', 'maxMessages', 'autoCleanEnabled', 'showTools'] as const;
type ConfigKey = typeof CONFIG_KEYS[number];

function fromEnv(): Partial<ConfigData> {
  const out: Partial<ConfigData> = {};
  const cleanDays = process.env['CSM_CLEAN_DAYS'];
  if (cleanDays !== undefined) {
    const n = Number(cleanDays);
    if (!isNaN(n)) out.cleanDays = n;
  }
  const maxMessages = process.env['CSM_MAX_MESSAGES'];
  if (maxMessages !== undefined) {
    const n = Number(maxMessages);
    if (!isNaN(n)) out.maxMessages = n;
  }
  const autoClean = process.env['CSM_AUTO_CLEAN_ENABLED'];
  if (autoClean !== undefined) out.autoCleanEnabled = autoClean !== 'false' && autoClean !== '0';
  const showTools = process.env['CSM_SHOW_TOOLS'];
  if (showTools !== undefined) out.showTools = showTools !== 'false' && showTools !== '0';
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
  const file = await loadRaw();
  const env = fromEnv();

  function resolve<T>(key: ConfigKey, defaultValue: T): ConfigEntry<T> {
    if (key in env) return { value: env[key] as T, source: 'env' as ConfigSource };
    const fileVal = (file as unknown as Record<string, unknown>)[key];
    const defaultVal = (DEFAULTS as unknown as Record<string, unknown>)[key];
    if (fileVal !== undefined && fileVal !== defaultVal) {
      return { value: fileVal as T, source: 'file' as ConfigSource };
    }
    return { value: defaultValue, source: 'default' as ConfigSource };
  }

  return {
    cleanDays: resolve('cleanDays', DEFAULTS.cleanDays),
    maxMessages: resolve('maxMessages', DEFAULTS.maxMessages),
    autoCleanEnabled: resolve('autoCleanEnabled', DEFAULTS.autoCleanEnabled),
    showTools: resolve('showTools', DEFAULTS.showTools),
  };
}

export async function saveConfig(data: Partial<ConfigData>): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  const current = await loadRaw();
  const next: ConfigData = { ...current, ...data };
  const content = JSON.stringify(next, null, 2) + '\n';
  const tmp = `${CONFIG_FILE}.tmp`;

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
  // Restore default
  (next as Record<string, unknown>)[key] = DEFAULTS[key];
  await saveConfig(next);
}

export function parseConfigValue(key: ConfigKey, raw: string): number | boolean {
  const defaultVal = DEFAULTS[key];
  if (typeof defaultVal === 'number') {
    const n = Number(raw);
    if (isNaN(n)) throw new Error(`${key} must be a number`);
    return n;
  }
  if (typeof defaultVal === 'boolean') {
    if (raw === 'true' || raw === '1') return true;
    if (raw === 'false' || raw === '0') return false;
    throw new Error(`${key} must be true or false`);
  }
  throw new Error(`Unknown config key: ${key}`);
}

export { CONFIG_KEYS, type ConfigKey };
