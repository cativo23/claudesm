# csm - Claude Session Manager

When user types `/csm` or `/csm <command>`, execute the csm CLI and show results.

## Commands

- `/csm` or `/csm help` - Show help
- `/csm list` - List all sessions
- `/csm clean [--days N] [--force]` - Clean old sessions
- `/csm remove <id> [--force]` - Remove specific session
- `/csm resume <id>` - Show resume command
- `/csm status` - Show statistics

## Implementation

Run the csm CLI command and display output:

```bash
~/.csm/bin/csm.sh <args>
```

**Note**: TUI is not available inside Claude. Use CLI commands only.

## Examples

```
/csm list
/csm clean --days 7 --force
/csm status
/csm resume abc123
```
