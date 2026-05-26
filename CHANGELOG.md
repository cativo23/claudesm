# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2026-05-26

### Added
- Filterable, scrolling session picker — press `/` in the TUI to search by id, project, or description. The list now windows to the terminal height (centered on the cursor) instead of rendering every session at once. Added `j`/`k` navigation alongside the arrow keys.
- Resume now launches `claude --resume` directly in the session's project directory, instead of only printing the command. The `resume --spawn` flag does the same from the CLI.

### Fixed
- Project paths containing `-` (e.g. `ms-crm-bluemedical`) were shown with hyphens turned into slashes. The UI and resume now use the real working directory recorded in the session transcript rather than the lossy slug.

## [2.0.1] - 2026-05-26

### Fixed
- Output extension changed from `.mjs` to `.js` — npm rejected `.mjs` bin entries; `"type": "module"` makes `.js` files ESM equivalents.
- Tag-based auto-release and npm publish via GitHub Actions (trusted publisher, no token required).

## [2.0.0] - 2026-05-26

### Added
- TypeScript rewrite — the entire codebase is now TypeScript (Node.js 20.10+).
- npm distribution: install globally with `npm install -g claudesm` or run ad-hoc with `npx claudesm`.
- Cross-platform support: macOS, Linux, and Windows.
- Ink-based TUI — the interactive interface is now powered by [Ink](https://github.com/vadimdemedes/ink) (React for terminals). Keyboard shortcuts are unchanged.
- `config` subcommand with `get`, `set`, `unset`, `list`, `path`, and `edit` operations.
- OS-native config location: `~/.config/claudesm/config.json` (Linux), `~/Library/Preferences/claudesm/config.json` (macOS), `%APPDATA%\claudesm\Config\config.json` (Windows).

### Changed
- Package renamed from `claude-session-manager` to `claudesm` on npm; GitHub repo moved to `cativo23/claudesm`.
- Config format changed from `~/.csmrc` (shell variables) to a JSON file at the OS-native path above.
- Binary name `csm` is unchanged — all existing commands (`list`, `clean`, `remove`, `resume`, `status`, `help`) work as before.

### Removed
- Bash shell dependency — Node.js replaces bash, grep, sed, awk, fzf.
- `install.sh` / `uninstall.sh` bash installers (replaced by npm install/uninstall).

## [1.1.0] - 2026-03-08

### Added
- Added ANSI color variables (`GRAY`, `DIM`, `WHITE`, `MAGENTA`) to `colors.sh` to improve aesthetic flexibility.
- Refactored CLI headers and borders to use rounded corners (`╭───╮`).

### Changed
- Improved formatting and alignment in `tui.sh`, list, and status commands to ensure proper column spacing regardless of content length.
- Resolved shellcheck warnings regarding unused color variables (`SC2034`) and masking return values (`SC2155`).

## [1.0.0] - 2026-03-08

### Added
- First stable release 🚀
- macOS support: Fallback to BSD `stat` (`stat -f %m`) when fetching file modification time.

### Changed
- Migrated the `/csm` skill to the new Agent Skills standard ([agentskills.io](https://agentskills.io)):
  - Updated structure to use `skills/csm/SKILL.md` with YAML frontmatter.
  - Added `disable-model-invocation: true` to prevent automatic triggering.
- Updated `install.sh` to install the skill in the new format and clean up legacy files.
- Removed redundant skill installation to the deprecated plugins directory.
- Refactored `list` and `status` commands to use native bash arrays instead of `ls | wc -l` for better performance and safety.

### Fixed
- Fixed bug in `remove.sh` and `clean.sh` argument parsing where ID could be destroyed if flags were passed before the ID.

## [0.3.5] - 2026-03-08

### Changed
- Migrated the `/csm` skill to the new Agent Skills standard ([agentskills.io](https://agentskills.io)):
  - Updated structure to use `skills/csm/SKILL.md` with YAML frontmatter.
  - Added `disable-model-invocation: true` to prevent automatic triggering.
- Updated `install.sh` to install the skill in the new format and clean up legacy files.
- Removed redundant skill installation to the deprecated plugins directory.

## [0.3.4] - 2026-03-08

### Changed
- Improved formatting and alignment of the ASCII art header in README.md

## [0.3.3] - 2026-03-08

### Fixed
- Fixed release workflow missing `contents: write` permissions, which caused 403 Forbidden errors when creating tags and releases.
- Switched to using GitHub CLI natively for release creation instead of a third-party action.

## [0.3.2] - 2026-03-08

### Fixed
- Fixed version extraction bug that caused releases to fail when using the `v` prefix.

## [0.3.1] - 2026-03-08

### Fixed
- Fixed release workflow trigger that was incorrectly skipped on PR merge to main

## [0.3.0] - 2026-03-08

### Added
- GitFlow branching model with automated releases
- Release workflow for automatic GitHub releases on merge to main
- PULL_REQUEST_TEMPLATE.md for standardized PRs

### Changed
- CI workflow now targets develop branch for PRs
- README.md header updated with slant figlet font

### Documentation
- CONTRIBUTING.md with complete GitFlow guide
- AGENTS.md with development workflow
- README.md with GitFlow quick reference

## [0.2.0] - 2026-03-08

### Added
- Professional installer with sudo support
- Uninstaller script

### Changed
- Install binary to /usr/local/bin by default
- Use English comments in shell scripts

### Fixed
- Shellcheck warnings
- Code formatting with shfmt

## [0.1.0] - 2026-03-01

### Added
- Terminal UI (TUI) for session management
- Session listing with detailed information
- Session cleanup functionality
- Session resume command generator
- Status command showing statistics
- Help command
- Configuration file support (~/.csmrc)
- Auto-cleanup hook for Claude sessions
- Slash command for Claude Code (/csm)
- Optional fzf integration for enhanced TUI

[Unreleased]: https://github.com/cativo23/claudesm/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/cativo23/claudesm/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/cativo23/claudesm/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/cativo23/claudesm/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/cativo23/claudesm/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/cativo23/claudesm/compare/v0.3.5...v1.0.0
[0.3.5]: https://github.com/cativo23/claudesm/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/cativo23/claudesm/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/cativo23/claudesm/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/cativo23/claudesm/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/cativo23/claudesm/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/cativo23/claudesm/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/cativo23/claudesm/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/cativo23/claudesm/tree/v0.1.0
