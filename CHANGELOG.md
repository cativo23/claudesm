# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/cativo23/claude-session-manager/compare/v0.3.2...HEAD
[0.3.2]: https://github.com/cativo23/claude-session-manager/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/cativo23/claude-session-manager/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/cativo23/claude-session-manager/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/cativo23/claude-session-manager/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/cativo23/claude-session-manager/tree/v0.1.0
