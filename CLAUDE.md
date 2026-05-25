# Claude Code

For all development tasks, follow [AGENTS.md](./AGENTS.md).

## Quick Commands

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev -- list

# Build
npm run build

# Type-check & lint
npm run typecheck && npm run lint
```

## Git

- **Branch from**: `develop`
- **PRs to**: `develop`
- **Commit style**: Gitmoji + Conventional Commits

## Project Structure

- **Entry point**: `src/cli.ts`
- **Commands**: `src/commands/` (TypeScript, `.ts` / `.tsx` for TUI)
- **Libraries**: `src/lib/` (sessions, config, format helpers)
- **Config**: OS-native JSON (see `csm config path`)
