#!/bin/bash
# install.sh - Instalador de Claude Session Manager
# Uso: curl -fsSL https://raw.githubusercontent.com/cativo23/csm/main/install.sh | bash

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
CSM_DIR="$HOME/.csm"
BIN_DIR="$CSM_DIR/bin"
REPO_URL="https://github.com/cativo23/claude-session-manager"

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

# Verificar dependencias
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

# Crear directorios
create_directories() {
	info "Creating directories..."

	mkdir -p "$BIN_DIR"
	mkdir -p "$CSM_DIR/skills"

	success "Directories created"
}

# Descargar archivos
download_files() {
	info "Downloading files..."

	# Descargar desde GitHub o copiar localmente
	if [ -n "$LOCAL_INSTALL" ]; then
		# Instalación local (para desarrollo)
		local src_dir
		src_dir="$(dirname "$0")/src"

		if [ -d "$src_dir" ]; then
			cp -r "$src_dir"/* "$BIN_DIR/"
		else
			error "Local source directory not found: $src_dir"
			exit 1
		fi
	else
		# Descargar desde GitHub
		local branch="${BRANCH:-main}"

		# Descargar entry point
		curl -fsSL "$REPO_URL/raw/$branch/src/csm.sh" -o "$BIN_DIR/csm.sh"

		# Descargar librerías
		mkdir -p "$BIN_DIR/lib"
		for lib in common.sh config.sh colors.sh description.sh; do
			curl -fsSL "$REPO_URL/raw/$branch/src/lib/$lib" -o "$BIN_DIR/lib/$lib"
		done

		# Descargar comandos
		mkdir -p "$BIN_DIR/commands"
		for cmd in list.sh clean.sh remove.sh resume.sh status.sh help.sh tui.sh; do
			curl -fsSL "$REPO_URL/raw/$branch/src/commands/$cmd" -o "$BIN_DIR/commands/$cmd"
		done
	fi

	# Hacer ejecutables
	chmod +x "$BIN_DIR/csm.sh"
	chmod +x "$BIN_DIR/lib/"*.sh
	chmod +x "$BIN_DIR/commands/"*.sh

	success "Files downloaded"
}

# Instalar binario en PATH del sistema
install_binary() {
	info "Installing binary to system PATH..."

	# Intentar instalar en /usr/local/bin (no requiere sudo si ya existe)
	if [ -w "/usr/local/bin" ]; then
		cp "$BIN_DIR/csm.sh" /usr/local/bin/csm
		chmod +x /usr/local/bin/csm
		success "Installed to /usr/local/bin/csm"
		return 0
	fi

	# Intentar con sudo
	if sudo -n true 2>/dev/null; then
		sudo cp "$BIN_DIR/csm.sh" /usr/local/bin/csm
		sudo chmod +x /usr/local/bin/csm
		success "Installed to /usr/local/bin/csm (with sudo)"
		return 0
	fi

	# Fallback: ~/.local/bin
	local local_bin="$HOME/.local/bin"
	mkdir -p "$local_bin"
	cp "$BIN_DIR/csm.sh" "$local_bin/csm"
	chmod +x "$local_bin/csm"
	success "Installed to $local_bin/csm"

	# Verificar si ~/.local/bin está en PATH
	if [[ ":$PATH:" != *":$local_bin:"* ]]; then
		warning "$local_bin is not in your PATH"
		info "Add it with: export PATH=\"$local_bin:\$PATH\""
	fi
}

# Instalar skill para Claude Code
install_skill() {
	info "Installing Claude Code skill..."

	local skills_dir="$HOME/.claude/skills"
	local plugins_dir="$HOME/.claude/plugins"

	# Crear directorio
	mkdir -p "$skills_dir"

	# Crear archivo del skill
	cat >"$skills_dir/csm.md" <<'SKILL_EOF'
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

Note: TUI is not available inside Claude. Use CLI commands only.
SKILL_EOF

	# También copiar a plugins por compatibilidad
	mkdir -p "$plugins_dir"
	cp "$skills_dir/csm.md" "$plugins_dir/csm.md" 2>/dev/null || true

	success "Skill installed to $skills_dir/csm.md"
}

# Mostrar mensaje final
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

# Main
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

# Ejecutar
main "$@"
