<div align="center">

```
                                ________    ___   __  ______  ______
                               / ____/ /   /   | / / / / __ \/ ____/
                              / /   / /   / /| |/ / / / / / / __/
                             / /___/ /___/ ___ / /_/ / /_/ / /___
                             \____/_____/_/  |_\____/_____/_____/

                               _____ ________________ ________  _   __
                              / ___// ____/ ___/ ___//  _/ __ \/ | / /
                              \__ \/ __/  \__ \\__ \ / // / / /  |/ /
                             ___/ / /___ ___/ /__/ // // /_/ / /|  /
                            /____/_____//____/____/___/\____/_/ |_/

                            __  ______    _   _____   ________________
                           /  |/  /   |  / | / /   | / ____/ ____/ __ \
                          / /|_/ / /| | /  |/ / /| |/ / __/ __/ / /_/ /
                         / /  / / ___ |/ /|  / ___ / /_/ / /___/ _, _/
                        /_/  /_/_/  | |_/_/ |_/_/  |_\____/_____/_/ |_|
```

**Manage your Claude Code sessions with elegance.**

List, clean, remove, and resume sessions from a beautiful TUI or CLI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![CI](https://github.com/cativo23/claudesm/actions/workflows/ci.yml/badge.svg?style=flat-square)](https://github.com/cativo23/claudesm/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/claudesm.svg?style=flat-square)](https://www.npmjs.com/package/claudesm)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Node](https://img.shields.io/badge/Node-20.10%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

</div>

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [TUI Keyboard Shortcuts](#tui-keyboard-shortcuts)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

**Install globally via npm:**

```bash
npm install -g claudesm
```

**Or run without installing:**

```bash
npx claudesm
```

Then use the `csm` binary:

```bash
csm          # open interactive TUI
csm list     # list sessions
csm status   # show statistics
```

---

## Features

- **Beautiful TUI** - Navigate sessions with an intuitive Ink-powered interface
- **Quick Actions** - List, clean, remove, and resume in seconds
- **Auto-Cleanup** - Optionally clean old sessions before each Claude session
- **Slash Command** - Use `/csm` directly inside Claude Code
- **Cross-Platform** - Works on macOS, Linux, and Windows
- **Configurable** - OS-native JSON config with `csm config` subcommand

---

## Installation

### Prerequisites

| Requirement | Version | Notes |
|:------------|:--------|:------|
| **Node.js** | 20.10+ | Required |
| **npm** | 8+ | Bundled with Node |

### Install via npm

```bash
npm install -g claudesm
```

### Run without installing

```bash
npx claudesm
```

### Upgrade

```bash
npm update -g claudesm
```

---

## Usage

### CLI Commands

| Command | Description |
|:--------|:------------|
| `csm` | Open interactive TUI |
| `csm list` | List all sessions |
| `csm clean [options]` | Clean old sessions |
| `csm remove <id>` | Remove specific session |
| `csm resume <id>` | Show resume command |
| `csm status` | Show statistics |
| `csm config <sub>` | Manage configuration |
| `csm --help` | Show help |

#### Config subcommands

| Subcommand | Description |
|:-----------|:------------|
| `csm config list` | Show all config values |
| `csm config get <key>` | Get a single value |
| `csm config set <key> <value>` | Set a value |
| `csm config unset <key>` | Remove a key |
| `csm config path` | Print config file path |
| `csm config edit` | Open config in $EDITOR |
| `csm config migrate` | Migrate from ~/.csmrc |

### Examples

```bash
# List all sessions
csm list

# Clean sessions older than 14 days
csm clean --days 14

# Clean without confirmation
csm clean --force

# Remove a specific session
csm remove abc123

# Show how to resume a session
csm resume abc123

# Show statistics (sessions, messages, disk size)
csm status
```

### Inside Claude Code (Slash Command)

After installing, use `/csm` inside Claude Code:

```
/csm list        # Show sessions
/csm clean       # Clean old sessions
/csm status      # Show statistics
```

> **Note**: TUI is only available in CLI (`csm` command), not inside Claude.

---

## Configuration

Configuration is stored as JSON in an OS-native location:

| Platform | Path |
|:---------|:-----|
| **Linux** | `~/.config/claudesm/config.json` |
| **macOS** | `~/Library/Preferences/claudesm/config.json` |
| **Windows** | `%APPDATA%\claudesm\Config\config.json` |

Print the active path with:

```bash
csm config path
```

Example `config.json`:

```json
{
  "cleanDays": 14
}
```

Manage config from the CLI:

```bash
csm config set cleanDays 14
csm config get cleanDays
csm config list
csm config edit    # opens in $EDITOR
```

### Auto-Cleanup Hook

Add to your `~/.zshrc` or `~/.bashrc` to auto-clean before each Claude session:

```bash
claude() {
    csm clean --force --days 7 2>/dev/null
    command claude "$@"
}
```

---

## TUI Keyboard Shortcuts

| Key | Action |
|:----|:-------|
| `↑/↓` | Navigate sessions |
| `Enter` | Open action menu |
| `r` | Resume selected session |
| `d` | Delete selected session |
| `c` | Clean old sessions |
| `s` | Show status |
| `?` | Show help overlay |
| `q` / `Esc` | Quit |

**Inside the action menu:**

| Key | Action |
|:----|:-------|
| `r` | Resume session |
| `d` | Delete session |
| `c` | Print session ID to stdout |
| `Esc` | Back |

---

## Project Structure

```
claudesm/
├── src/
│   ├── csm.ts               # Entry point / CLI wiring (Commander.js)
│   ├── default-action.ts    # TUI launcher (runs when no subcommand given)
│   ├── commands/            # Command implementations
│   │   ├── list.ts
│   │   ├── clean.ts
│   │   ├── remove.ts
│   │   ├── resume.ts
│   │   ├── status.ts
│   │   └── config.ts
│   ├── ui/                  # Ink TUI components
│   │   ├── App.tsx
│   │   ├── SessionList.tsx
│   │   ├── ActionMenu.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── HelpOverlay.tsx
│   │   ├── StatusView.tsx
│   │   ├── StatusBar.tsx
│   │   └── EmptyState.tsx
│   └── lib/                 # Shared utilities
│       ├── config.ts        # Config loader (OS-native paths)
│       ├── paths.ts         # OS-native path resolution
│       ├── types.ts         # Shared TypeScript types
│       ├── errors.ts        # CsmError hierarchy
│       ├── render.ts        # Output formatting helpers
│       ├── fs-safe.ts       # Safe filesystem helpers
│       └── sessions/        # Session discovery & parsing
│           ├── discover.ts
│           ├── parse.ts
│           └── current.ts
├── skills/
│   └── csm/
│       └── SKILL.md         # Claude Code skill
├── package.json
├── tsdown.config.ts
├── tsconfig.json
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

---

## Requirements

- **Required**: Node.js 20.10+, npm 8+
- **Platforms**: macOS, Linux, Windows

---

## Development

### Running Locally

```bash
# Clone the repo
git clone https://github.com/cativo23/claudesm.git
cd claudesm

# Install dependencies
npm install

# Run in dev mode (ts-node / tsx)
npm run dev -- list

# Build
npm run build

# Link globally for local testing
npm link
```

### Running Tests

```bash
# Type-check
npm run typecheck

# Lint
npm run lint

# Run tests
npm test
```

### Git Workflow

This project uses GitFlow. All contributions must follow the branching model:

| Branch | Purpose | PR Target |
|--------|---------|-----------|
| `main` | Stable releases | N/A |
| `develop` | Integration branch | N/A |
| `feature/*` | Features | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `release/vX.Y.Z` | Releases | `main` |
| `hotfix/*` | Urgent fixes | `main` |

**Quick start:**

```bash
# Branch from develop
git checkout develop && git pull
git checkout -b feature/your-feature

# Commit with gitmoji + conventional commits
git commit -m "✨ feat: add amazing feature"

# PR to develop
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full GitFlow guide.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using Conventional Commits + Gitmoji
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to `develop`

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the Claude Code community**

[Report Bug](https://github.com/cativo23/claudesm/issues) · [Request Feature](https://github.com/cativo23/claudesm/issues)

</div>
