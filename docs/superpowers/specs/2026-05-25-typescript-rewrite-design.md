# claudesm TypeScript Rewrite — Design Spec

**Date:** 2026-05-25
**Status:** Approved (post-Opus review, round 3 — all BLOCKERs resolved)
**Author:** Carlos Cativo

---

## Overview

`claudesm` is a cross-platform CLI + TUI tool for managing Claude Code AI sessions. This spec covers the full rewrite from Bash to TypeScript, distributed via npm as the `claudesm` package with `csm` binary.

**Goals:**
- Cross-platform: macOS, Linux, Windows (native)
- npm distribution: `npx claudesm` and `npm install -g claudesm`
- Feature parity with v1.1.0 bash version (all commands, flags, defaults preserved)
- Fix the multi-project-directory bug in the Bash version
- Ship a proper interactive TUI (Ink) from day one
- Proper OS-native config (JSON, no shell-sourced rc file)

**Non-goals:**
- Plugin system
- Remote/cloud session sync
- Rewriting the Claude Code agent itself

**Semver:** v2.0.0 — major bump justified by TypeScript rewrite, npm distribution model, and config format change.

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript (ESM source) | Type safety, cross-platform, npm distribution |
| Bundle | tsdown (Rolldown/Oxc) | tsup successor, 3-10x faster, actively maintained by Evan You |
| CLI framework | Commander.js | 35M weekly downloads, zero deps, ~20ms startup |
| TUI | Ink 7.x | Used by Claude Code itself; React mental model, Yoga flexbox. **Requires React 19.** |
| Prompts (non-TTY) | @clack/prompts | For piped/CI contexts where Ink cannot mount; never mix with Ink in same flow |
| Process spawning | execa | Cross-platform, ergonomic, signal handling |
| Colors | picocolors | 7KB, zero deps, respects NO_COLOR/FORCE_COLOR=0\|1 |
| Config paths | env-paths (suffix: '') | OS-native dirs on macOS/Linux/Windows |
| Runtime detection | std-env | TTY, CI, WSL detection for Ink fallback |
| Clean shutdown | signal-exit | Ink renderer teardown when child processes are running |
| Update notifier | update-notifier | Expected convention; suppress when Ink is rendering |
| Node minimum | 20.10 LTS | Stable fetch, top-level await, node:test |

**React version:** Ink 7 requires React 19 (`peerDependencies: { react: ">=19.2.0" }`). Use `react@^19.2.0` and `@types/react@^19.2.0`. No overrides block needed.

---

## File Structure

```
claudesm/
├── src/
│   ├── csm.ts                       # ~20 lines: Commander setup + register() calls + lazy load
│   ├── default-action.ts            # `csm` with no args → TTY check → Ink TUI or list fallback
│   ├── commands/
│   │   ├── list.ts                  # exports register(program: Command)
│   │   ├── clean.ts
│   │   ├── remove.ts
│   │   ├── resume.ts
│   │   ├── status.ts
│   │   └── config.ts                # csm config get|set|unset|list|path|edit
│   ├── ui/
│   │   ├── App.tsx                  # root Ink component
│   │   ├── SessionList.tsx
│   │   ├── ProjectGroup.tsx
│   │   ├── SessionRow.tsx
│   │   ├── StatusBar.tsx
│   │   ├── ActionMenu.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── HelpOverlay.tsx
│   │   ├── StatusView.tsx
│   │   └── EmptyState.tsx
│   └── lib/
│       ├── paths.ts                 # Claude data root, slug decode (opaque), env-paths config dir
│       ├── config.ts                # load/save, atomic writes, env var override, source tracking
│       ├── sessions/
│       │   ├── discover.ts          # enumerate ALL project dirs + .jsonl files
│       │   ├── parse.ts             # streaming readline JSONL reader — never readFileSync
│       │   ├── describe.ts          # first-message extraction, tool tallies (single pass)
│       │   └── current.ts           # resolve current session: $CLAUDE_SESSION_ID → ~/.claude/current-session → none
│       ├── render.ts                # table, bytes, date formatting
│       ├── fs-safe.ts               # atomic delete with dry-run support; fs.rm({ force: true })
│       └── errors.ts                # typed errors → exit codes
├── dist/                            # tsdown output (gitignored)
├── tsdown.config.ts
├── tsconfig.json
└── package.json
```

**No `lib/colors.ts` wrapper** — import picocolors directly (`import pc from 'picocolors'`). An extra layer is YAGNI.

**No `commands/tui.ts` stub** — the TUI is the default action, not a subcommand. `csm.ts` does not import `default-action.ts` until invoked. Backward compat: register `csm tui` as an alias for the default action (see Commands section).

**Default action wiring in `csm.ts`:** Commander's `program.action()` fires only when no recognized subcommand is matched. Wire it as:
```ts
program.action(async () => {
  const { run } = await import('./default-action.js');
  await run();
});
```
This must be registered BEFORE `program.parse(process.argv)`. Commander calls it when `argv` has no recognized subcommand (e.g. `csm` or `csm --help` does NOT trigger it — `--help` is intercepted first).

---

## Lazy Command Loading

Each command is loaded via `import()` inside its action handler — not at startup. `csm.ts` only imports commander metadata. This keeps `npx claudesm --help` cold-start fast.

Pattern in `csm.ts`:
```ts
program
  .command('list')
  .description('List all sessions')
  .option('-a, --all', 'include hidden sessions')
  .option('-c, --current', 'show only current session')
  .option('--json', 'output as JSON')
  .action(async (opts) => {
    const { run } = await import('./commands/list.js');
    await run(opts);
  });
```

Each `commands/*.ts` exports a `run(opts)` function. The `register(program)` pattern is dropped in favour of this approach — it keeps csm.ts slim and enables lazy loading without a separate impl file.

---

## Data Model

### Session directories

Claude Code stores sessions under:
```
~/.claude/projects/
  -home-username-projects-myapp/       ← slug of /home/username/projects/myapp
    <session-uuid>.jsonl
  -home-username-projects-other/
    ...
```

**Slug encoding (verified from bash source `common.sh`):**
Every `/` in the absolute path is replaced with `-`, then the whole string is prefixed with `-`. Example: `/home/carlos/projects/myapp` → `-home-carlos-projects-myapp`.

**Slug decode is lossy and must be treated as opaque.** Path components containing `-` are ambiguous after encoding. The implementation must:
1. Treat slugs as opaque project identifiers
2. Attempt a best-effort cosmetic decode for display only (replace `-` with `/`, strip leading `/`)
3. Log unknown/unexpected slug formats and continue — never crash
4. Never use the decoded path for filesystem operations; always use the raw slug

**Windows path:** Claude Code on Windows writes slugs derived from `%USERPROFILE%` — format to be verified on first Windows test run. Write the decoder defensively with a `WARN: unknown slug format` log.

**Multi-project:** The bash version only ever operated on ONE project directory (guessed from `$HOME`). The rewrite enumerates ALL project directories. `discover.ts` returns sessions grouped by project slug, and all commands operate across all projects by default. A `--project <slug>` filter may be added later.

**Session discovery filtering (critical):** Each project directory under `~/.claude/projects/<slug>/` contains BOTH `.jsonl` session files AND subdirectories (e.g. `memory/`, `<uuid>/` sibling dirs). `discover.ts` MUST filter to `dirent.isFile() && name.endsWith('.jsonl')` — never process subdirectories as sessions. Treating a directory as a session file will crash; attempting to delete the `<uuid>/` directory when removing a session will corrupt data.

### JSONL format

Each `.jsonl` file is one JSON object per line. The discriminator is `"type"`, not `"role"`:

```jsonc
// user message
{"type":"user","message":{"role":"user","content":[{"type":"text","text":"..."}]},"sessionId":"...","parentUuid":"...","uuid":"...","timestamp":"..."}

// assistant message
{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"..."},{"type":"tool_use","id":"...","name":"Bash","input":{}}]},"sessionId":"...","uuid":"...","timestamp":"..."}

// other record types (do not count as messages)
{"type":"permission-mode","permissionMode":"..."}
{"type":"summary","summary":"..."}
{"type":"attachment","..."}
```

**Critical implementation notes:**
- `content` is an array of blocks, NOT a string. Never assume string content.
- To extract the session description: find first entry with `type === "user"`, then find the first `content` block with `type === "text"`, take its `text` field.
- Tool tallies: scan entries with `type === "assistant"`, accumulate counts of `content` blocks where `block.type === "tool_use"`, keyed by `block.name`.
- Message count: count entries where `type` ∈ `{"user", "assistant"}` — not raw line count. The bash `wc -l` metric counted ALL entry types including permission/summary records; the TS version will use real message count. Surface old behavior via a note in `csm status` output if needed.
- **Streaming is mandatory.** Files can be tens of MB. Use `readline` line-by-line. Do all accumulation (description + tool tallies + message count) in a single pass.

### Metadata directory

The bash version also manages `~/.claude/usage-data/session-meta/<session-id>.json` (the `META_DIR`). Both `clean` and `remove` delete the corresponding meta file. The TS rewrite must do the same. Add `META_DIR` path to `paths.ts`.

---

## Configuration

### Paths (via `env-paths` with `suffix: ''`)

| Platform | Config file |
|---|---|
| Linux | `~/.config/claudesm/config.json` |
| macOS | `~/Library/Preferences/claudesm/config.json` |
| Windows | `%APPDATA%\claudesm\Config\config.json` |

Override: `CSM_CONFIG_DIR` environment variable. One escape hatch, documented.

### Format

```json
{
  "$schema": "https://claudesm.dev/schema/config-v1.json",
  "version": 1,
  "cleanDays": 7,
  "maxMessages": 500,
  "autoCleanEnabled": true,
  "showTools": true
}
```

**Defaults match bash version exactly** (`config.sh`): `cleanDays: 7`, `maxMessages: 500`, `autoCleanEnabled: true`, `showTools: true`.

- `version: 1` from day one — enables future migrations
- camelCase on disk, `CSM_*` env vars at runtime
- Env var precedence: CLI flag → `CSM_*` env var → config file → built-in default
- Config loader returns `{ value, source }` per key (`'default' | 'file' | 'env'`) so `csm config list` can show the source column

### Atomic write

```ts
// Always: write to .tmp, then rename
const tmp = `${configFile}.tmp`;
await fs.writeFile(tmp, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });
await fs.rename(tmp, configFile);
// On Windows: rename can fail with EBUSY (antivirus lock) — retry once after 100ms, then fall back to fs.cp + fs.unlink
```

### Migration from `~/.csmrc`

`~/.csmrc` is a **shell-sourced file**, not a plain `KEY=VALUE` file. It may contain shell expressions (`CSM_CLEAN_DAYS=$((7*2))`), comments, and quoted values.

Migration strategy: On first launch, if `~/.csmrc` exists and no config.json exists yet, run `csm config migrate` automatically:
1. Parse only literal `KEY=VALUE` lines (regex: `/^(CSM_[A-Z_]+)=([^#\n"]+|"[^"]*")/`)
2. Lines that don't match are reported as "skipped — manual review needed"
3. Numeric values coerced to numbers; `true`/`false` to booleans
4. Write the resulting JSON config
5. Print the new config path and the skipped lines

Shell expressions are NOT evaluated (no exec). If the user had expressions, they must set values manually via `csm config set`.

### `csm config` subcommand

```
csm config get <key>          # print effective value + source
csm config set <key> <value>  # validate type + write atomically
csm config unset <key>        # reset to default (remove key from JSON)
csm config list               # all keys, value, source (default/file/env)
csm config path               # print absolute config file path
csm config edit               # open in $VISUAL → $EDITOR → nano (Linux) → notepad (Windows)
csm config migrate            # one-time import from ~/.csmrc
```

Validate on write, not on read. Bad data never reaches disk.

---

## Commands

All commands follow the lazy-load pattern (`run(opts)` exported, loaded via `import()` in action handler).

| Command | Flags | Notes |
|---|---|---|
| `csm` (no args) | — | TTY check → Ink TUI; falls back to `csm list` (no flags) on non-TTY |
| `csm list` | `-a/--all`, `-c/--current`, `--json` | `--all` includes hidden sessions (`.` prefix); `--current` shows only current session (if no current session: message to stderr, exit 0, empty stdout — preserves shell composability); `--json` outputs `{ projects: ProjectRecord[] }` |
| `csm clean` | `--days/-d N`, `--force/-f`, `--dry-run` | Default days: 7 (from config `cleanDays`); skips current session; deletes both `.jsonl` and `META_DIR` entry |
| `csm remove <id>` | `--force/-f` | Accepts partial session ID (substring match, first result); refuses to remove current session without `--force`; deletes `.jsonl` + META entry |
| `csm resume <id>` | `--spawn` | Default: **print** `claude --resume <id>` for user to copy (preserving bash behavior); `--spawn` flag activates `execa('claude', ['--resume', id], { stdio: 'inherit' })` |
| `csm status` | `--json` | Shows session count, real message count (type∈{user,assistant}), disk usage |
| `csm config` | get/set/unset/list/path/edit/migrate | See config section |
| `csm tui` | — | Alias for default action (backward compat) |
| `csm help` | — | Alias for `--help` (Commander built-in, aliased for parity) |

**Unknown commands:** Commander prints an error to stderr + exits 1 (NOT full help by default). Wire `.showHelpAfterError()` if full help on unknown command is desired. This differs from bash (fell through to TUI). Breaking change; document in migration notes.

**`csm help`:** Register explicitly via `program.helpCommand(true)` — Commander does not add a `help` subcommand by default; only `--help / -h` are native.

**`--version / -V`:** Wired via Commander's `.version(pkg.version)`. Prints `csm vX.Y.Z`.

### `find_session` partial match semantics

Accepts a substring of the session UUID. If multiple sessions match:
- If exactly one match: proceed
- If multiple matches: print the list of matching IDs with their descriptions and exit 1 with "Ambiguous session ID — be more specific"

Never silently operate on the wrong session.

### Auto-clean

`CSM_AUTO_CLEAN_ENABLED=true` (bash config) had no consumer in the bash codebase. The TS version implements it:

- Fires only for interactive commands (TUI, `list`, `clean`, `remove`, `resume`, `status`). **Skip** for `config`, `help`, `--help`, `--version` — these should never incur startup latency.
- On startup, if `autoCleanEnabled` is true and the `last-clean` marker file is older than `cleanDays` days, run `clean --force` silently and update the marker.
- Marker file path: resolved from `env-paths('claudesm', { suffix: '' }).config` + `/last-clean` — uses the same OS-native base as config.json (macOS: `~/Library/Preferences/claudesm/last-clean`, Windows: `%APPDATA%\claudesm\Config\last-clean`, Linux: `~/.config/claudesm/last-clean`).

---

## TUI (Ink)

Default action when `csm` is called with no arguments (or `csm tui`). Mounts an Ink React app.

### TTY detection

```ts
import { hasTTY, isCI } from 'std-env'; // hasTTY, NOT isTTY — std-env@3/4 does not export isTTY

const canRenderTUI = hasTTY && !isCI;
if (!canRenderTUI) {
  // run list command with text output
  const { run } = await import('./commands/list.js');
  await run({});
  process.exit(0);
}
```

Check BOTH stdin and stdout TTY. Wraps Ink `render()` in try/catch for `ENOTTY` raw-mode failures (WSL broken raw mode — `claude-code#559`):

```ts
try {
  const { unmount } = render(<App />);
  // signal-exit handles cleanup when child processes are running
} catch (err) {
  if ((err as NodeJS.ErrnoException).code === 'ENOTTY') {
    // fallback to list
    const { run } = await import('./commands/list.js');
    await run({});
  } else throw err;
}
```

### Ink component hierarchy

All components live under `src/ui/`.

**Shared types:**
```ts
interface Session {
  id: string;           // full UUID
  projectSlug: string;  // raw slug (opaque)
  projectDisplay: string; // best-effort decoded path for display
  filePath: string;     // absolute path to .jsonl
  timestamp: Date;
  messageCount: number; // type∈{user,assistant} only
  description: string;  // first user text block, trimmed
  tools: Record<string, number>; // tool name → use count
  isCurrent: boolean;
  sizeBytes: number;
}

interface ProjectRecord {
  slug: string;        // raw project slug
  display: string;     // best-effort decoded path for display
  sessions: Session[];
}

// --json output shape for csm list
interface ListJsonOutput {
  projects: ProjectRecord[];
}
```

**Component map:**

| Component | Props | Responsibility |
|---|---|---|
| `App` | — | Owns state: sessions[], selectedIndex, mode (list/action/confirm/help/status), loading, error. Wires `useInput` globally. |
| `SessionList` | `sessions, selectedIndex, onSelect` | Scrollable grouped list |
| `ProjectGroup` | `slug, display, sessions, selectedIndex, onSelect` | Renders project header + session rows |
| `SessionRow` | `session, isSelected` | ID, date, message count, description preview. Colors match bash: cyan for header, green for active, yellow for age warnings |
| `StatusBar` | `mode` | Bottom bar showing context-sensitive keybinding hints |
| `ActionMenu` | `session, onAction` | Appears on Enter: Resume / Remove / Copy ID |
| `ConfirmDialog` | `message, onConfirm, onCancel` | Rendered when `d` is pressed — "Delete session X? [y/N]" |
| `HelpOverlay` | `onClose` | Full keybinding table, shown on `?` |
| `StatusView` | `stats` | Aggregate session stats, shown on `s` |
| `EmptyState` | — | No sessions found |

**State machine (mode field):**
`list` → `action` (Enter) → `confirm` (d) → `list` (confirmed/cancelled)
`list` → `help` (?) → `list` (q/Esc)
`list` → `status` (s) → `list` (q/Esc)

**Loading state:** Show a spinner (Ink's `<Spinner>`) while discover+parse runs. Error state: print error message with instructions (e.g., "~/.claude not found — have you run Claude Code yet?").

### Keybindings

| Key | Action |
|---|---|
| `↑/↓` | Navigate |
| `Enter` | Open ActionMenu |
| `r` | Resume selected (print command or spawn per config) |
| `d` | Delete selected (shows ConfirmDialog) |
| `c` | Run clean with configured defaults |
| `s` | Toggle StatusView |
| `?` | Toggle HelpOverlay |
| `q / Esc` | Quit |

### Style guide (bash → Ink mapping)

| Bash color | picocolors (CLI) | Ink Text color |
|---|---|---|
| Cyan (headers) | `pc.cyan()` | `color="cyan"` |
| Green (active/ok) | `pc.green()` | `color="green"` |
| Yellow (warnings) | `pc.yellow()` | `color="yellow"` |
| Red (errors) | `pc.red()` | `color="red"` |
| Gray/dim (secondary) | `pc.gray()` | `dimColor` |
| Bold | `pc.bold()` | `bold` |

### update-notifier + Ink

update-notifier prints a banner to stdout. When Ink is rendering, suppress it: call `notifier.notify()` only after `unmount()` resolves. In CLI-only paths (non-TUI), notify normally.

---

## Cross-platform concerns

| Concern | Solution |
|---|---|
| Home directory | `os.homedir()` — never hardcode |
| Path separators | `node:path` everywhere, no string concat |
| Session slug decode | Opaque identifier; best-effort display only; defensive against unknown formats |
| Spawning `claude` (`--spawn`) | `execa('claude', [...], { stdio: 'inherit', shell: false })` |
| `claude` not in PATH | `ClaudeNotFoundError` → print install instructions, exit 3 |
| File deletion | `fs.rm({ force: true })` — handles Windows read-only |
| ANSI colors | picocolors auto-detects NO_COLOR and FORCE_COLOR=0\|1 |
| Config file perms | `mode: 0o600` on write (no-op on Windows, harmless) |
| Atomic write on Windows | retry rename once after 100ms on EBUSY, fall back to cp+unlink |
| EOL in config | `\n` hardcoded (JSON files use LF universally) |
| sudo detection | Refuse if `process.geteuid?.() === 0 && process.env.SUDO_USER` is set (drop the homedir check — macOS root home is `/var/root`, not `/root`). Clear message: "Don't run csm with sudo." |
| Windows PATH for `claude` | execa with `shell: false` finds `.cmd` wrappers correctly on Windows |
| Node version runtime check | Check `process.versions.node` at startup; exit with friendly message if below `20.10` |
| ANSI in Ink on Windows | Works in Windows Terminal; legacy cmd.exe: picocolors auto-strips |
| Windows glob in test script | Use `glob-cli` or `node --test src` directory scan instead of shell glob |

---

## Error handling

Typed errors with consistent exit codes:

```ts
abstract class CsmError extends Error {
  abstract exitCode: number;
}
class SessionNotFoundError extends CsmError { exitCode = 1 }
class ConfigParseError extends CsmError { exitCode = 2 }
class ClaudeNotFoundError extends CsmError { exitCode = 3 }
class ClaudeDataDirMissingError extends CsmError { exitCode = 4 } // ~/.claude/ doesn't exist
class NoSessionsFoundError extends CsmError { exitCode = 5 }
class CorruptedSessionError extends CsmError { exitCode = 6 }
class DiskFullError extends CsmError { exitCode = 7 }
class AmbiguousSessionIdError extends CsmError { exitCode = 8 }
```

Commander `.exitOverride()` + top-level catch maps to clean `pc.red('Error: ...')` + correct exit code. No stack traces to end users. Stack traces available via `CSM_DEBUG=1`.

Additional failure modes handled gracefully (not crashed):
- `~/.claude/` doesn't exist → `ClaudeDataDirMissingError` with "Have you run Claude Code yet?"
- `~/.claude/projects/` empty → `NoSessionsFoundError`
- `.jsonl` file has corrupted line → skip line, log warning with line number, continue
- Disk full during atomic rename → `DiskFullError`
- `claude` binary not in PATH → `ClaudeNotFoundError`
- `current-session` file unreadable → treat as no current session (warn, don't crash)

---

## package.json

```json
{
  "name": "claudesm",
  "version": "2.0.0",
  "description": "Manage your Claude Code sessions with elegance",
  "type": "module",
  "bin": { "csm": "./dist/csm.cjs" },
  "files": ["dist", "README.md", "LICENSE"],
  "engines": { "node": ">=20.10" },
  "scripts": {
    "build": "tsdown",
    "dev": "tsx src/csm.ts",
    "typecheck": "tsc --noEmit",
    "test": "node --test --import tsx/esm src",
    "prepublishOnly": "npm run typecheck && npm run test && npm run build"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "ink": "^7.0.3",
    "react": "^19.2.0",
    "@clack/prompts": "^1.0.0",
    "execa": "^9.5.0",
    "picocolors": "^1.1.0",
    "env-paths": "^3.0.0",
    "std-env": "^3.8.0",
    "signal-exit": "^4.1.0",
    "update-notifier": "^7.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^19.2.0",
    "ink-testing-library": "^4.0.0",
    "tsdown": "^0.22.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

**Note on `signal-exit`:** Ink handles SIGINT via `useInput`. `signal-exit` is used specifically to ensure Ink unmounts cleanly when a child process (execa `claude --resume`) is running and the user Ctrl+C's the parent. Without it, the terminal may be left in raw mode.

---

## tsdown.config.ts

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { csm: 'src/csm.ts' },
  format: ['cjs'],
  target: 'node20',
  outExtension: () => ({ js: '.cjs' }),
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  sourcemap: true,
  minify: false,
  treeshake: true,
});
```

Source: ESM. Output: single CJS file with shebang. `.cjs` extension forces CommonJS module resolution regardless of `"type": "module"` in package.json.

---

## Testing strategy

- `node:test` built-in (no external framework)
- Unit tests for `lib/sessions/parse.ts`, `lib/sessions/describe.ts`, `lib/paths.ts`, `lib/config.ts`
- Integration tests: temp `~/.claude/projects/` fixture with real JSONL samples
- Ink components: `ink-testing-library`
- CI: GitHub Actions on `ubuntu-latest`, `macos-latest`, `windows-latest`
- Test script uses `node --test --import tsx/esm src` (directory scan, no shell glob — avoids Windows glob expansion issue)
- Note: `node --test <dir>` recursive directory scanning requires Node 20.11+. Runtime minimum stays 20.10; CI test matrix should use Node 20.11+ or 22 LTS.
- `node:test` coverage flags stabilised in Node 22. For coverage reports, use Node 22 LTS in CI.

---

## Migration from Bash version (user-facing)

```
csm config migrate      # one-time: imports ~/.csmrc if present
npm install -g claudesm # replaces the old ~/.csm/ bash install
npm uninstall -g claudesm + rm -rf ~/.csm   # full removal
```

**Breaking changes from v1.x (bash):**
- Install: `npm install -g claudesm` instead of `curl | bash`
- Config: JSON at OS-native path instead of `~/.csmrc`
- `csm` (no args): Ink TUI (same as before, different implementation)
- `csm resume <id>`: prints command by default (same as before); use `--spawn` to launch directly
- Unknown commands: print help + exit 1 (bash fell through to TUI)
- Message count in `csm status`: now counts user+assistant entries only (was raw line count)
- `cleanDays` default: 7 (unchanged)

**Binary name `csm` is unchanged.** Existing shell aliases and muscle memory work without modification.

---

## Out of scope for v2.0

- `--project <slug>` filter flag (multi-project already supported in discovery, filter is UX polish)
- Session search / full-text filter
- Export to markdown/HTML
- Remote sync
- `csm tui` as explicit subcommand with sub-options (it's an alias for default action)
