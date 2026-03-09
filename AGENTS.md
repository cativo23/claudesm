# AGENTS.md

> Instructions for AI coding agents working on this project.

## Project Overview

- **Name**: Claude Session Manager (csm)
- **Description**: Bash-based tool for managing Claude Code sessions
- **Tech Stack**: Bash 4.0+, grep, sed, awk, stat, fzf (optional)
- **Repository**: https://github.com/cativo23/claude-session-manager

## Quick Start

```bash
# The project is installed in ~/.csm
# Main script entry point
~/.csm/bin/csm.sh

# Common commands
csm list      # List all sessions
csm clean     # Clean old sessions
csm tui       # Open terminal UI
csm help      # Show help
```

## File Structure

```
claude-session-manager/
├── src/
│   ├── csm.sh              # Entry point
│   ├── commands/           # CLI commands
│   │   ├── list.sh
│   │   ├── clean.sh
│   │   ├── remove.sh
│   │   ├── resume.sh
│   │   ├── status.sh
│   │   ├── help.sh
│   │   └── tui.sh
│   └── lib/                # Libraries
│       ├── common.sh       # Common utilities
│       ├── config.sh       # Configuration handling
│       ├── colors.sh       # Color utilities
│       └── description.sh  # Session description
├── skills/                 # Claude Code skills
├── install.sh              # Installation script
└── uninstall.sh            # Uninstallation script
```

## Code Style

### Shell Scripts

```bash
#!/bin/bash
# filename.sh - Brief description

# Globals: UPPERCASE
readonly GLOBAL_CONST="value"
GLOBAL_VAR=""

# Function: snake_case with cmd_ prefix for commands
cmd_example() {
    local input="$1"
    local result

    # Essential comments only (in English)
    result="$input"
}
```

**Rules:**
- **Indentation**: Tabs
- **Variables**: `UPPERCASE` for globals, `lowercase` for locals
- **Functions**: `snake_case` with `cmd_` prefix for command functions
- **Comments**: English, essential only
- **Error handling**: Use `die()` function from common.sh

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
shfmt -w .           # Format code
find src -type f -name "*.sh" -exec shellcheck {} +  # Lint
```

## Agent Rules

### ✅ DO

- Format code with `shfmt` before committing
- Fix all shellcheck warnings
- Ask when unsure about authentication/security code
- Propose a plan for complex changes
- Use existing utility functions from `lib/common.sh`
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
| `get_current_session` | Get current session ID | `lib/common.sh` |
| `find_session` | Find session by partial ID | `lib/common.sh` |
| `get_first_message` | Extract first user message | `lib/common.sh` |
| `load_config` | Load user configuration | `lib/config.sh` |
| `die` | Show error and exit | `lib/common.sh` |

## Configuration

User config is stored at `~/.csmrc`. Load it with:

```bash
source "$SCRIPT_DIR/lib/config.sh"
load_config "$HOME/.csmrc"
```
