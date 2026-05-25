import { Command } from 'commander';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Runtime Node version check
const [major, minor] = process.versions.node.split('.').map(Number);
if (major! < 20 || (major === 20 && minor! < 10)) {
  process.stderr.write(`csm requires Node.js >=20.10. You have ${process.versions.node}.\n`);
  process.exit(1);
}

// Sudo guard
if (process.geteuid?.() === 0 && process.env['SUDO_USER']) {
  process.stderr.write("Don't run csm with sudo.\n");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

const program = new Command();

program
  .name('csm')
  .version(`v${pkg.version}`, '-V, --version')
  .description('Manage your Claude Code sessions')
  .exitOverride()
  .showHelpAfterError(false);

// Default action: TTY → Ink TUI, non-TTY → list
// Also catches unknown commands (program.args has the unrecognized operand)
program.action(async () => {
  const unknownArg = program.args[0];
  if (unknownArg) {
    process.stderr.write(`error: unknown command '${unknownArg}'\n\nRun 'csm --help' for usage.\n`);
    process.exit(1);
  }
  const { run } = await import('./default-action.js');
  await run();
});

program
  .command('list')
  .alias('ls')
  .description('List all sessions')
  .option('-a, --all', 'include hidden sessions')
  .option('-c, --current', 'show only current session')
  .option('--json', 'output as JSON')
  .action(async (opts) => {
    const { run } = await import('./commands/list.js');
    await run(opts);
  });

program
  .command('clean')
  .description('Remove sessions older than N days')
  .option('-d, --days <n>', 'age threshold in days', (v) => {
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 1) throw new Error('--days must be a positive integer');
    return n;
  })
  .option('-f, --force', 'delete without prompting')
  .option('--dry-run', 'preview without deleting')
  .action(async (opts) => {
    const { run } = await import('./commands/clean.js');
    await run(opts);
  });

program
  .command('remove <id>')
  .alias('rm')
  .description('Remove a session by ID (partial match)')
  .option('-f, --force', 'skip confirmation')
  .action(async (id, opts) => {
    const { run } = await import('./commands/remove.js');
    await run(id, opts);
  });

program
  .command('resume <id>')
  .description('Resume a session (prints command by default)')
  .option('--spawn', 'launch claude --resume directly')
  .action(async (id, opts) => {
    const { run } = await import('./commands/resume.js');
    await run(id, opts);
  });

program
  .command('status')
  .description('Show session statistics')
  .option('--json', 'output as JSON')
  .action(async (opts) => {
    const { run } = await import('./commands/status.js');
    await run(opts);
  });

// config subcommand group
const configCmd = program
  .command('config')
  .description('Manage configuration');

configCmd
  .command('get <key>')
  .description('Get a config value')
  .action(async (key) => {
    const { run } = await import('./commands/config.js');
    await run({ subcommand: 'get', key });
  });

configCmd
  .command('set <key> <value>')
  .description('Set a config value')
  .action(async (key, value) => {
    const { run } = await import('./commands/config.js');
    await run({ subcommand: 'set', key, value });
  });

configCmd
  .command('unset <key>')
  .description('Reset a config value to default')
  .action(async (key) => {
    const { run } = await import('./commands/config.js');
    await run({ subcommand: 'unset', key });
  });

configCmd
  .command('list')
  .description('List all config values with sources')
  .action(async () => {
    const { run } = await import('./commands/config.js');
    await run({ subcommand: 'list' });
  });

configCmd
  .command('path')
  .description('Print config file path')
  .action(async () => {
    const { run } = await import('./commands/config.js');
    await run({ subcommand: 'path' });
  });

configCmd
  .command('edit')
  .description('Open config in $EDITOR')
  .action(async () => {
    const { run } = await import('./commands/config.js');
    await run({ subcommand: 'edit' });
  });

configCmd
  .command('migrate')
  .description('Import settings from legacy ~/.csmrc')
  .action(async () => {
    const { run } = await import('./commands/config.js');
    await run({ subcommand: 'migrate' });
  });

// tui alias for default action
program
  .command('tui')
  .description('Open interactive session picker (alias for default action)')
  .action(async () => {
    const { run } = await import('./default-action.js');
    await run();
  });

(async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    // Commander throws on exitOverride — handle --help and --version exits gracefully
    if ((err as { code?: string }).code === 'commander.helpDisplayed' ||
        (err as { code?: string }).code === 'commander.version') {
      process.exit(0);
    }
    // CSM typed errors
    const { CsmError } = await import('./lib/errors.js');
    const { printError } = await import('./lib/render.js');
    if (err instanceof CsmError) {
      if (process.env['CSM_DEBUG']) console.error(err);
      else printError(err.message);
      process.exit(err.exitCode);
    }
    // Unknown errors
    if (process.env['CSM_DEBUG']) console.error(err);
    else process.stderr.write(`Unexpected error: ${(err as Error).message ?? err}\n`);
    process.exit(1);
  }
})();
