# AGENTS.md

> Instructions for AI coding agents working on this project.

## Project Overview

- **Name**: claudesm (csm)
- **Description**: TypeScript CLI for managing Claude Code sessions, distributed via npm
- **Tech Stack**: TypeScript, Node.js 20.10+, Ink (React TUI), tsdown
- **Repository**: https://github.com/cativo23/claudesm

## Quick Start

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev -- list

# Build the project
npm run build

# Link globally for local testing
npm link

# Common commands
csm list      # List all sessions
csm clean     # Clean old sessions
csm config    # Manage configuration
csm help      # Show help
```

## File Structure

```
claudesm/
├── src/
│   ├── cli.ts              # Entry point / CLI bootstrap
│   ├── commands/           # CLI commands
│   │   ├── list.ts
│   │   ├── clean.ts
│   │   ├── remove.ts
│   │   ├── resume.ts
│   │   ├── status.ts
│   │   ├── help.ts
│   │   ├── config.ts
│   │   └── tui.tsx         # Ink-based TUI
│   └── lib/                # Shared utilities
│       ├── config.ts       # Config loader (OS-native paths)
│       ├── sessions.ts     # Session discovery & parsing
│       └── format.ts       # Output formatting helpers
├── skills/                 # Claude Code skills
├── package.json
└── tsconfig.json
```

## Code Style

### TypeScript

```typescript
// commands/example.ts - Brief description

import type { Session } from '../lib/sessions.js';

// Named exports preferred over default
export async function runExample(id: string): Promise<void> {
    // Essential comments only, in English
    const session = await findSession(id);
    if (!session) throw new Error(`Session not found: ${id}`);
}
```

**Rules:**
- **Indentation**: 2 spaces
- **Types**: explicit return types on exported functions; infer locals
- **Imports**: use `.js` extension (ESM); named exports over default
- **Error handling**: throw typed `Error` instances; never `process.exit` inside lib code
- **Async**: `async/await` throughout; no raw Promise chains

## Development Workflow

This project uses GitFlow. See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

### Branching Model

| Branch | Purpose | PR Target |
|--------|---------|-----------|
| `main` | Stable releases only | N/A |
| `develop` | Integration branch | N/A |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `release/vX.Y.Z` | Release prep | `main` |
| `hotfix/*` | Urgent fixes | `main` |

### Quick Start

```bash
# Branch from develop
git checkout develop && git pull
git checkout -b feature/your-feature

# Commit with gitmoji + conventional commits
git commit -m "✨ feat: add amazing feature"

# PR to develop
```

### Before Commit

```bash
npm run typecheck    # Type-check TypeScript
npm run lint         # ESLint
npm run build        # Verify build succeeds
npm test             # Run test suite
```

## Agent Rules

### ✅ DO

- Run `npm run typecheck` and `npm run lint` before committing
- Fix all TypeScript and ESLint errors
- Ask when unsure about authentication/security code
- Propose a plan for complex changes
- Use existing utility functions from `src/lib/`
- Keep changes minimal and focused

### ❌ DON'T

- Push to remote without approval
- Modify CI/CD workflows without asking
- Commit secrets or credentials
- Force push or modify git history
- Delete tests or bypass CI
- Add speculative features or "nice-to-have" changes
- Use external dependencies without asking

## When Stuck

1. Ask a clarifying question
2. Propose a short plan for review
3. Do NOT push large speculative changes

## Key Functions Reference

| Function | Purpose | Location |
|----------|---------|----------|
| `getCurrentSession` | Get current session ID | `lib/sessions.ts` |
| `findSession` | Find session by partial ID | `lib/sessions.ts` |
| `getFirstMessage` | Extract first user message | `lib/sessions.ts` |
| `loadConfig` | Load user configuration | `lib/config.ts` |
| `getConfigPath` | Return OS-native config path | `lib/config.ts` |

## Configuration

User config is a JSON file at an OS-native path. Use `getConfigPath()` to resolve it:

```typescript
import { loadConfig, getConfigPath } from '../lib/config.js';

const config = await loadConfig();
console.log(getConfigPath()); // e.g. ~/.config/claudesm/config.json
```
