# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitFlow branching model with automated releases
- Release workflow for automatic GitHub releases

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

[Unreleased]: https://github.com/cativo23/claude-session-manager/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/cativo23/claude-session-manager/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/cativo23/claude-session-manager/tree/v0.1.0
