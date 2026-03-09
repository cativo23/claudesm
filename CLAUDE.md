# Claude Code

For all development tasks, follow [AGENTS.md](./AGENTS.md).

## Quick Commands

```bash
# Install locally
LOCAL_INSTALL=1 ./install.sh

# Format & lint
shfmt -w . && find src -type f -name "*.sh" -exec shellcheck {} +
```

## Git

- **Branch from**: `develop`
- **PRs to**: `develop`
- **Commit style**: Gitmoji + Conventional Commits

## Project Structure

- **Main**: `src/csm.sh`
- **Commands**: `src/commands/`
- **Libraries**: `src/lib/`
- **Config**: `~/.csmrc`
