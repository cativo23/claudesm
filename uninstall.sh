#!/bin/bash
# uninstall.sh - Desinstalador de Claude Session Manager
# Uso: curl -fsSL https://raw.githubusercontent.com/cativo23/csm/main/uninstall.sh | bash

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
CSM_DIR="$HOME/.csm"
SKILLS_DIR="$HOME/.claude/skills"
PLUGINS_DIR="$HOME/.claude/plugins"

# Funciones de output
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

# Variables de opción
FORCE=false
DRY_RUN=false
NEEDS_SUDO=false

# Verificar si necesita sudo desde el inicio
check_sudo_needed() {
	# Si el binario está en /usr/local/bin y no tenemos permisos, necesitamos sudo
	if [ -f "/usr/local/bin/csm" ] && [ ! -w "/usr/local/bin" ]; then
		NEEDS_SUDO=true
	fi
}

# Re-ejecutar con sudo si es necesario
ensure_sudo() {
	if [ "$NEEDS_SUDO" = true ] && [ "$(id -u)" -ne 0 ]; then
		if command -v sudo &>/dev/null; then
			info "This operation requires sudo privileges..."
			sudo "$0" "$@"
			exit $?
		else
			error "sudo is required but not available"
			exit 1
		fi
	fi
}
show_help() {
	echo "Claude Session Manager - Uninstall Script"
	echo ""
	echo "USAGE:"
	echo "    $0 [options]"
	echo ""
	echo "OPTIONS:"
	echo "    --force, -f      Skip confirmation prompts"
	echo "    --dry-run        Show what would be removed without making changes"
	echo "    --help, -h       Show this help message"
	echo ""
	echo "EXAMPLES:"
	echo "    $0                    # Interactive uninstall"
	echo "    $0 --force            # Uninstall without prompts"
	echo "    $0 --dry-run          # Preview what would be removed"
	echo ""
	echo "MANUAL REMOVAL:"
	echo "    sudo rm /usr/local/bin/csm"
	echo "    rm -rf ~/.csm"
	echo "    rm -f ~/.claude/skills/csm.md ~/.claude/plugins/csm.md"
	echo ""
	exit 0
}

# Parsear argumentos
parse_args() {
	while [[ $# -gt 0 ]]; do
		case $1 in
		--force | -f)
			FORCE=true
			shift
			;;
		--dry-run)
			DRY_RUN=true
			shift
			;;
		--help | -h)
			show_help
			;;
		*)
			shift
			;;
		esac
	done
}

# Preguntar confirmación
confirm() {
	local message="$1"

	if [ "$FORCE" = true ]; then
		return 0
	fi

	echo -n -e "${YELLOW}$message [y/N] ${NC}"
	read -r confirm
	[[ "$confirm" =~ ^[Yy]$ ]]
}

# Remover binario del sistema
remove_binary() {
	info "Removing binary from system PATH..."

	local removed=false

	# Remover de /usr/local/bin
	if [ -f "/usr/local/bin/csm" ]; then
		if [ "$DRY_RUN" = true ]; then
			info "Would remove /usr/local/bin/csm"
			removed=true
		elif [ -w "/usr/local/bin" ]; then
			# Tenemos permisos de escritura
			rm -f "/usr/local/bin/csm"
			success "Removed /usr/local/bin/csm"
			removed=true
		elif command -v sudo &>/dev/null; then
			# Intentar con sudo
			if sudo rm -f "/usr/local/bin/csm" 2>/dev/null; then
				success "Removed /usr/local/bin/csm"
				removed=true
			else
				warning "Could not remove /usr/local/bin/csm (permission denied)"
				info "Run manually: sudo rm /usr/local/bin/csm"
			fi
		else
			warning "Could not remove /usr/local/bin/csm (permission denied)"
			info "Run manually: sudo rm /usr/local/bin/csm"
		fi
	fi

	# Remover de ~/.local/bin
	if [ -f "$HOME/.local/bin/csm" ]; then
		if [ "$DRY_RUN" = true ]; then
			info "Would remove $HOME/.local/bin/csm"
		else
			rm -f "$HOME/.local/bin/csm"
			success "Removed $HOME/.local/bin/csm"
		fi
		removed=true
	fi

	if [ "$removed" = false ]; then
		warning "No csm binary found in system PATH"
	fi
}

# Remover directorio de instalación
remove_installation() {
	info "Removing installation directory..."

	if [ -d "$CSM_DIR" ]; then
		if [ "$DRY_RUN" = true ]; then
			info "Would remove $CSM_DIR"
		else
			rm -rf "$CSM_DIR"
			success "Removed $CSM_DIR"
		fi
	else
		info "Installation directory not found: $CSM_DIR"
	fi
}

# Remover skill de Claude Code
remove_skill() {
	info "Removing Claude Code skill..."

	local removed=false

	if [ -f "$SKILLS_DIR/csm.md" ]; then
		if [ "$DRY_RUN" = true ]; then
			info "Would remove $SKILLS_DIR/csm.md"
		else
			rm -f "$SKILLS_DIR/csm.md"
			success "Removed $SKILLS_DIR/csm.md"
		fi
		removed=true
	fi

	if [ -f "$PLUGINS_DIR/csm.md" ]; then
		if [ "$DRY_RUN" = true ]; then
			info "Would remove $PLUGINS_DIR/csm.md"
		else
			rm -f "$PLUGINS_DIR/csm.md"
			success "Removed $PLUGINS_DIR/csm.md"
		fi
		removed=true
	fi

	if [ "$removed" = false ]; then
		info "No csm skill found"
	fi
}

# Preguntar sobre configuración
remove_config() {
	local config_file="$HOME/.csmrc"

	if [ -f "$config_file" ]; then
		if [ "$DRY_RUN" = true ]; then
			info "Would ask about removing $config_file"
		elif confirm "Remove configuration file ($config_file)?"; then
			rm -f "$config_file"
			success "Removed $config_file"
		else
			info "Keeping $config_file"
		fi
	fi
}

# Verificar si queda algo
check_leftovers() {
	if [ "$DRY_RUN" = true ]; then
		info "Would check for leftovers"
		return
	fi

	info "Checking for leftovers..."

	local found=false

	# Buscar alias en shell rc files
	for rc_file in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.bash_profile"; do
		if [ -f "$rc_file" ] && grep -q "csm" "$rc_file" 2>/dev/null; then
			warning "Found csm references in $rc_file - you may want to remove them manually"
			grep -n "csm" "$rc_file" 2>/dev/null | head -5
			found=true
		fi
	done

	# Buscar binarios residuales
	for bin_path in "/usr/local/bin/csm" "$HOME/.local/bin/csm"; do
		if [ -f "$bin_path" ]; then
			warning "Found leftover binary: $bin_path"
			found=true
		fi
	done

	if [ "$found" = false ]; then
		success "No leftovers found"
	fi
}

# Mostrar mensaje final
show_final_message() {
	echo ""
	echo "=================================================="
	echo "  Claude Session Manager uninstalled!"
	echo "=================================================="
	echo ""
	echo "Note: Your Claude session files are preserved at:"
	echo "  $HOME/.claude/projects/"
	echo ""
	echo "To reinstall:"
	echo "  curl -fsSL https://raw.githubusercontent.com/cativo23/csm/main/install.sh | bash"
	echo ""
}

# Main
main() {
	parse_args "$@"

	echo ""
	echo "Uninstalling Claude Session Manager..."
	echo ""

	# Skip confirmation in dry-run mode
	if [ "$DRY_RUN" = false ]; then
		if ! confirm "Are you sure you want to uninstall csm?"; then
			echo "Uninstall cancelled"
			exit 0
		fi
	fi

	# Check and re-exec with sudo if needed (after confirmation)
	check_sudo_needed
	ensure_sudo "$@"

	remove_binary
	remove_installation
	remove_skill
	remove_config
	check_leftovers

	if [ "$DRY_RUN" = true ]; then
		echo ""
		info "Dry run complete - no changes were made"
	else
		show_final_message
	fi
}

# Ejecutar
main "$@"
