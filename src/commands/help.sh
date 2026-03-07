#!/bin/bash
# help.sh - Mostrar ayuda

# cmd_help - Mostrar ayuda
cmd_help() {
	cat <<'EOF'
Claude Session Manager (csm)

USAGE:
    csm <command> [options]

COMMANDS:
    list                List all sessions
    clean               Clean old sessions
    remove <id>         Remove specific session
    resume <id>         Show resume command for session
    status              Show session statistics
    help                Show this help message

OPTIONS:

  list:
    --all, -a           Show all sessions including hidden
    --current, -c       Show only current session

  clean:
    --days N            Sessions older than N days (default: 7)
    --force, -f         Remove without confirmation
    --dry-run, -n       Show what would be removed

  remove:
    --force, -f         Remove without confirmation

EXAMPLES:
    csm list                      # List all sessions
    csm clean --days 14           # Clean sessions older than 14 days
    csm clean --force             # Clean without asking
    csm remove abc123             # Remove session abc123
    csm resume abc123             # Show how to resume session
    csm status                    # Show statistics

CONFIGURATION:
    Create ~/.csmrc with:

    CSM_CLEAN_DAYS=7          # Days before clean
    CSM_MAX_MESSAGES=500      # Max messages threshold
    CSM_AUTO_CLEAN_ENABLED=1  # Enable auto-clean

For more information, see: https://github.com/cativo23/claude-session-manager
EOF
}
