import pc from 'picocolors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveConfig, saveConfig, unsetConfigKey, parseConfigValue, DEFAULTS, CONFIG_KEYS, type ConfigKey } from '../lib/config.js';
import { CONFIG_FILE } from '../lib/paths.js';
import { printError, printInfo } from '../lib/render.js';

function isConfigKey(k: string): k is ConfigKey {
  return (CONFIG_KEYS as readonly string[]).includes(k);
}

async function cmdGet(key: string): Promise<void> {
  if (!isConfigKey(key)) {
    printError(`Unknown config key: ${key}. Valid keys: ${CONFIG_KEYS.join(', ')}`);
    process.exit(1);
  }
  const config = await resolveConfig();
  const entry = config[key];
  process.stdout.write(`${key} = ${entry.value}  ${pc.dim(`(source: ${entry.source})`)}\n`);
}

async function cmdSet(key: string, value: string): Promise<void> {
  if (!isConfigKey(key)) {
    printError(`Unknown config key: ${key}`);
    process.exit(1);
  }
  const parsed = parseConfigValue(key, value);
  await saveConfig({ [key]: parsed });
  process.stdout.write(`${pc.green('✓')} ${key} = ${parsed}\n`);
}

async function cmdUnset(key: string): Promise<void> {
  if (!isConfigKey(key)) {
    printError(`Unknown config key: ${key}`);
    process.exit(1);
  }
  await unsetConfigKey(key);
  process.stdout.write(`${pc.green('✓')} ${key} reset to default (${DEFAULTS[key]})\n`);
}

async function cmdList(): Promise<void> {
  const config = await resolveConfig();
  process.stdout.write(`${pc.bold('Key'.padEnd(22))}${pc.bold('Value'.padEnd(12))}${pc.bold('Source')}\n`);
  process.stdout.write('─'.repeat(46) + '\n');
  for (const key of CONFIG_KEYS) {
    const entry = config[key];
    const sourceColor = entry.source === 'env' ? pc.yellow : entry.source === 'file' ? pc.cyan : pc.dim;
    process.stdout.write(
      `${key.padEnd(22)}${String(entry.value).padEnd(12)}${sourceColor(entry.source)}\n`
    );
  }
}

async function cmdPath(): Promise<void> {
  process.stdout.write(CONFIG_FILE + '\n');
}

async function cmdEdit(): Promise<void> {
  const { execa } = await import('execa');
  const editorStr = process.env['VISUAL'] ?? process.env['EDITOR'] ?? (process.platform === 'win32' ? 'notepad' : 'nano');
  const [editorBin, ...editorArgs] = editorStr.trim().split(/\s+/);
  try {
    // Ensure config file exists before opening
    await saveConfig({});
    await execa(editorBin!, [...editorArgs, CONFIG_FILE], { stdio: 'inherit' });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      printError(`Editor not found: ${editorBin}. Set $EDITOR or $VISUAL.`);
      process.exit(1);
    }
    throw err;
  }
}

async function cmdMigrate(): Promise<void> {
  const rcFile = path.join(process.env['HOME'] ?? process.env['USERPROFILE'] ?? '', '.csmrc');
  let content: string;
  try {
    content = await fs.readFile(rcFile, 'utf8');
  } catch {
    printInfo('No ~/.csmrc found — nothing to migrate.');
    return;
  }

  const parsed: Record<string, unknown> = {};
  const skipped: string[] = [];
  const keyMap: Record<string, ConfigKey> = {
    CSM_CLEAN_DAYS: 'cleanDays',
    CSM_MAX_MESSAGES: 'maxMessages',
    CSM_AUTO_CLEAN_ENABLED: 'autoCleanEnabled',
    CSM_SHOW_TOOLS: 'showTools',
  };

  for (const line of content.split('\n')) {
    const match = /^(CSM_[A-Z_]+)=([^#\n"]+|"[^"]*")/.exec(line.trim());
    if (!match) {
      if (line.trim() && !line.trim().startsWith('#')) skipped.push(line.trim());
      continue;
    }
    const [, envKey, rawVal] = match;
    const configKey = keyMap[envKey!];
    if (!configKey) { skipped.push(line.trim()); continue; }

    const val = rawVal!.replace(/^"|"$/g, '').trim();
    try {
      parsed[configKey] = parseConfigValue(configKey, val);
    } catch {
      skipped.push(line.trim());
    }
  }

  await saveConfig(parsed);
  process.stdout.write(`${pc.green('✓')} Migrated config to ${CONFIG_FILE}\n`);
  if (skipped.length > 0) {
    process.stdout.write(`\n${pc.yellow('Skipped lines (manual review needed):')}\n`);
    for (const l of skipped) process.stdout.write(`  ${pc.dim(l)}\n`);
  }
}

export interface ConfigOpts {
  subcommand: 'get' | 'set' | 'unset' | 'list' | 'path' | 'edit' | 'migrate';
  key?: string;
  value?: string;
}

export async function run(opts: ConfigOpts): Promise<void> {
  switch (opts.subcommand) {
    case 'get': return cmdGet(opts.key ?? '');
    case 'set': return cmdSet(opts.key ?? '', opts.value ?? '');
    case 'unset': return cmdUnset(opts.key ?? '');
    case 'list': return cmdList();
    case 'path': return cmdPath();
    case 'edit': return cmdEdit();
    case 'migrate': return cmdMigrate();
  }
}
