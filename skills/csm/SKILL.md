---
name: csm
description: Claude Session Manager. List, clean, remove, and resume sessions.
disable-model-invocation: true
allowed-tools: Bash
---

# csm - Claude Session Manager

When the user invokes this skill, execute the `csm` CLI command and show the results.

Command to run: `csm $ARGUMENTS`

Available subcommands:
- `list` - List all sessions
- `clean [--days N] [--force]` - Clean old sessions
- `remove <id> [--force]` - Remove specific session
- `resume <id>` - Show resume command
- `status` - Show statistics
