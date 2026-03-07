# Claude Session Manager (csm)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Shellcheck](https://github.com/cativo23/claude-session-manager/actions/workflows/shellcheck.yml/badge.svg)](https://github.com/cativo23/claude-session-manager/actions)

Manage your Claude Code sessions with ease. List, clean, remove, and resume sessions from a beautiful TUI or CLI.

![Preview](https://via.placeholder.com/800x400?text=CSM+TUI+Preview)

## Quick Install

### One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/cativo23/claude-session-manager/main/install.sh | bash
```

Then reload your shell:
```bash
source ~/.bashrc   # or source ~/.zshrc
```

### Manual install

```bash
git clone https://github.com/cativo23/claude-session-manager.git
cd claude-session-manager

# Run local install
LOCAL_INSTALL=1 ./install.sh
```

## Usage

### CLI Commands

```bash
csm              # Interactive TUI
csm list         # List all sessions
csm clean        # Clean old sessions
csm remove <id>  # Remove specific session
csm resume <id>  # Show resume command
csm status       # Show statistics
csm help         # Show help
```

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

# Show statistics
csm status
```

### Inside Claude Code (Slash Command)

After installing, use `/csm` inside Claude Code:

```
/csm list        # Show sessions
/csm clean       # Clean old sessions
/csm status      # Show statistics
```

**Note**: TUI is only available in CLI (`csm` command), not inside Claude.

## Configuration (Optional)

Create `~/.csmrc` to customize:

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

## Advanced: Auto-cleanup

Add to your shell config to auto-clean before each Claude session:

```bash
# ~/.zshrc or ~/.bashrc
claude() {
    csm clean --force --days 7 2>/dev/null
    command claude "$@"
}
```

## TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `l` | List sessions |
| `c` | Clean old sessions |
| `r` | Remove session |
| `s` | Show status |
| `h` | Show help |
| `q` | Quit |

## Requirements

- **Required**: bash, grep, sed, awk, stat
- **Optional**: fzf (for enhanced TUI)

Without fzf, csm falls back to a basic select menu.

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
│       ├── list.sh           # List command
│       ├── clean.sh          # Clean command
│       ├── remove.sh         # Remove command
│       ├── resume.sh         # Resume command
│       ├── status.sh         # Status command
│       ├── help.sh           # Help command
│       └── tui.sh            # TUI interface
├── skills/
│   └── csm-skill.md          # Claude Code skill
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

## Development

### Running locally

```bash
# Clone the repo
git clone https://github.com/cativo23/claude-session-manager.git
cd claude-session-manager

# Run directly
./src/csm.sh --help

# Or install locally
LOCAL_INSTALL=1 ./install.sh
```

### Running tests

```bash
# Run shellcheck
shellcheck src/**/*.sh install.sh

# Run tests
./tests/run-tests.sh
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Claude Code community
- Inspired by tmux session management
