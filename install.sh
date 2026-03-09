#!/bin/bash
# Claude Session Manager Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/cativo23/csm/main/install.sh | bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect real user when running with sudo
if [ -n "$SUDO_USER" ]; then
	REAL_HOME="/home/$SUDO_USER"
	export HOME="$REAL_HOME"
fi

CSM_DIR="$HOME/.csm"
BIN_DIR="$CSM_DIR/bin"
REPO_URL="https://github.com/cativo23/claude-session-manager"

info() {
	echo -e "${BLUE}ℹ $*${NC}"
}

success() {
	echo -e "${GREEN}✓ $*${NC}"
}

warning() {
	echo -e "${YELLOW}⚠ $*${NC}"
}

error() {
	echo -e "${RED}✗ $*${NC}"
}

check_dependencies() {
	info "Checking dependencies..."

	local missing=()

	for cmd in bash grep sed awk stat; do
		if ! command -v "$cmd" &>/dev/null; then
			missing+=("$cmd")
		fi
	done

	if [ ${#missing[@]} -gt 0 ]; then
		error "Missing dependencies: ${missing[*]}"
		exit 1
	fi

	success "All dependencies found"
}

create_directories() {
	info "Creating directories..."

	mkdir -p "$BIN_DIR"
	mkdir -p "$CSM_DIR/skills"

	success "Directories created"
}

download_files() {
	info "Downloading files..."

	if [ -n "$LOCAL_INSTALL" ]; then
		local src_dir
		src_dir="$(dirname "$0")/src"

		if [ -d "$src_dir" ]; then
			cp -r "$src_dir"/* "$BIN_DIR/"
		else
			error "Local source directory not found: $src_dir"
			exit 1
		fi
	else
		local branch="${BRANCH:-main}"

		curl -fsSL "$REPO_URL/raw/$branch/src/csm.sh" -o "$BIN_DIR/csm.sh"

		mkdir -p "$BIN_DIR/lib"
		for lib in common.sh config.sh colors.sh description.sh; do
			curl -fsSL "$REPO_URL/raw/$branch/src/lib/$lib" -o "$BIN_DIR/lib/$lib"
		done

		mkdir -p "$BIN_DIR/commands"
		for cmd in list.sh clean.sh remove.sh resume.sh status.sh help.sh tui.sh; do
			curl -fsSL "$REPO_URL/raw/$branch/src/commands/$cmd" -o "$BIN_DIR/commands/$cmd"
		done
	fi

	chmod +x "$BIN_DIR/csm.sh"
	chmod +x "$BIN_DIR/lib/"*.sh
	chmod +x "$BIN_DIR/commands/"*.sh

	success "Files downloaded"
}

install_binary() {
	info "Installing binary to system PATH..."

	local target_dir="/usr/local/bin"
	local use_sudo=false

	if [ ! -w "/usr/local/bin" ]; then
		if command -v sudo &>/dev/null; then
			use_sudo=true
		else
			error "Cannot write to /usr/local/bin and sudo is not available"
			error "Please run: sudo $0"
			exit 1
		fi
	fi

	local wrapper_script
	wrapper_script='#!/bin/bash
CSM_INSTALL_DIR="$HOME/.csm/bin"
if [ ! -f "$CSM_INSTALL_DIR/csm.sh" ]; then
	echo "Error: csm not properly installed at $CSM_INSTALL_DIR" >&2
	exit 1
fi
exec "$CSM_INSTALL_DIR/csm.sh" "$@"'

	if [ "$use_sudo" = true ]; then
		echo "$wrapper_script" | sudo tee "$target_dir/csm" >/dev/null
		sudo chmod +x "$target_dir/csm"
		success "Installed to $target_dir/csm"
	else
		echo "$wrapper_script" >"$target_dir/csm"
		chmod +x "$target_dir/csm"
		success "Installed to $target_dir/csm"
	fi

	if ! command -v csm &>/dev/null; then
		warning "$target_dir is not in your PATH"
		info "Add it with: export PATH=\"$target_dir:\$PATH\""
	fi
}

install_skill() {
	info "Installing Claude Code skill..."

	local skills_dir="$HOME/.claude/skills"
	local plugins_dir="$HOME/.claude/plugins"
	local skill_dest="$skills_dir/csm/SKILL.md"

	# Clean up legacy files
	rm -f "$skills_dir/csm.md"
	rm -f "$plugins_dir/csm.md"

	mkdir -p "$skills_dir/csm"

	cat >"$skill_dest" <<'SKILL_EOF'
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
SKILL_EOF

	success "Skill installed to $skill_dest"
}

show_final_message() {
	echo ""
	echo "=================================================="
	echo "  Claude Session Manager installed successfully!"
	echo "=================================================="
	echo ""
	echo "Usage:"
	echo "  csm              # Interactive TUI"
	echo "  csm list         # List sessions"
	echo "  csm clean        # Clean old sessions"
	echo "  csm status       # Show statistics"
	echo "  csm help         # Show help"
	echo ""
	echo "Inside Claude Code:"
	echo "  /csm list    - List sessions"
	echo "  /csm status  - Show statistics"
	echo ""
	echo "For more info: $REPO_URL"
	echo ""
}

main() {
	echo ""
	echo "Installing Claude Session Manager..."
	echo ""

	check_dependencies
	create_directories
	download_files
	install_binary
	install_skill
	show_final_message
}

main "$@"
