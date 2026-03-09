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
[![CI](https://github.com/cativo23/claude-session-manager/actions/workflows/ci.yml/badge.svg?style=flat-square)](https://github.com/cativo23/claude-session-manager/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Bash](https://img.shields.io/badge/Bash-4%2B-4EAA25?style=flat-square&logo=gnubash&logoColor=white)](https://www.gnu.org/software/bash/)

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

**One-liner install:**

```bash
curl -fsSL https://raw.githubusercontent.com/cativo23/claude-session-manager/main/install.sh | bash
```

**Or clone manually:**

```bash
git clone https://github.com/cativo23/claude-session-manager.git
cd claude-session-manager
LOCAL_INSTALL=1 ./install.sh
```

Then reload your shell:
```bash
source ~/.bashrc   # or source ~/.zshrc
```

---

## Features

- **Beautiful TUI** - Navigate sessions with an intuitive interface
- **Quick Actions** - List, clean, remove, and resume in seconds
- **Auto-Cleanup** - Optionally clean old sessions before each Claude session
- **Slash Command** - Use `/csm` directly inside Claude Code
- **Lightweight** - Pure bash, no external dependencies required
- **Configurable** - Customize behavior via `~/.csmrc`

---

## Installation

### Prerequisites

| Requirement | Version | Required |
|:------------|:--------|:---------|
| **Bash** | 4.0+ | Yes |
| **grep, sed, awk** | any | Yes |
| **stat** | any | Yes |
| **fzf** | any | Optional (enhanced TUI) |

### Automatic Install

```bash
curl -fsSL https://raw.githubusercontent.com/cativo23/claude-session-manager/main/install.sh | bash
```

### Manual Install

```bash
git clone https://github.com/cativo23/claude-session-manager.git
cd claude-session-manager
LOCAL_INSTALL=1 ./install.sh
```

### Upgrade

```bash
csm --upgrade
# or
cd claude-session-manager && git pull && ./install.sh
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
| `csm help` | Show help |

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

# Show statistics (total sessions, messages, tokens)
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

Create `~/.csmrc` to customize behavior:

```bash
# Days before a session is considered old (default: 7)
CSM_CLEAN_DAYS=14

# Max messages before "abandoned" (default: 500)
CSM_MAX_MESSAGES=500

# Enable auto-clean (default: true)
CSM_AUTO_CLEAN_ENABLED=true

# Show tools usage in list (default: true)
CSM_SHOW_TOOLS=true
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
| `l` | List sessions |
| `c` | Clean old sessions |
| `r` | Remove session |
| `s` | Show status |
| `h` | Show help |
| `q` | Quit |
| `↑/↓` | Navigate |
| `Enter` | Select |
| `Space` | Toggle (multi-select) |

---

## Project Structure

```
claude-session-manager/
├── install.sh                 # Installer script
├── src/
│   ├── csm.sh                # Main entry point
│   ├── lib/
│   │   ├── common.sh         # Common utilities
│   │   ├── config.sh         # Configuration loader
│   │   ├── colors.sh         # Colors and formatting
│   │   └── description.sh    # Session description generator
│   └── commands/
│       ├── list.sh           # List sessions
│       ├── clean.sh          # Clean old sessions
│       ├── remove.sh         # Remove session
│       ├── resume.sh         # Show resume command
│       ├── status.sh         # Show statistics
│       ├── help.sh           # Show help
│       └── tui.sh            # TUI interface
├── skills/
│   └── csm-skill.md          # Claude Code skill
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

---

## Requirements

- **Required**: bash 4+, grep, sed, awk, stat
- **Optional**: fzf (for enhanced TUI experience)

Without fzf, csm falls back to a basic select menu.

---

## Development

### Running Locally

```bash
# Clone the repo
git clone https://github.com/cativo23/claude-session-manager.git
cd claude-session-manager

# Run directly
./src/csm.sh --help

# Or install locally
LOCAL_INSTALL=1 ./install.sh
```

### Running Tests

```bash
# Format & lint
shfmt -w . && shellcheck src/**/*.sh install.sh

# Run tests
./tests/run-tests.sh
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

[Report Bug](https://github.com/cativo23/claude-session-manager/issues) · [Request Feature](https://github.com/cativo23/claude-session-manager/issues)

</div>
