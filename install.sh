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
        local src_dir="$(dirname "$0")/src"

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

# Configurar shell
setup_shell() {
    info "Setting up shell..."

    # Detectar shell
    local rc_file=""
    local shell_name

    if [ -n "$CSM_SHELL" ]; then
        shell_name="$CSM_SHELL"
    else
        shell_name=$(basename "$SHELL")
    fi

    case "$shell_name" in
        bash)
            rc_file="$HOME/.bashrc"
            ;;
        zsh)
            rc_file="$HOME/.zshrc"
            ;;
        *)
            warning "Unknown shell: $shell_name, trying .bashrc"
            rc_file="$HOME/.bashrc"
            ;;
    esac

    # Crear backup
    if [ -f "$rc_file" ]; then
        cp "$rc_file" "${rc_file}.csm.bak"
        info "Backup created: ${rc_file}.csm.bak"
    fi

    # Agregar configuración
    local config_added=false

    # Agregar PATH
    if ! grep -q 'CSM_DIR' "$rc_file" 2>/dev/null; then
        echo "" >> "$rc_file"
        echo "# Claude Session Manager" >> "$rc_file"
        echo 'export CSM_DIR="$HOME/.csm"' >> "$rc_file"
        echo 'export PATH="$CSM_DIR/bin:$PATH"' >> "$rc_file"
        config_added=true
    fi

    # Agregar alias
    if ! grep -q 'alias csm=' "$rc_file" 2>/dev/null; then
        echo 'alias csm="$CSM_DIR/bin/csm.sh"' >> "$rc_file"
        config_added=true
    fi

    if [ "$config_added" = true ]; then
        success "Shell configuration added to $rc_file"
        info "Run 'source $rc_file' or restart your terminal"
    else
        info "Shell already configured"
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
    cat > "$skills_dir/csm.md" << 'SKILL_EOF'
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
    echo "Next steps:"
    echo "  1. Run: source ${rc_file:-\$HOME/.bashrc}"
    echo "  2. Try: csm --help"
    echo "  3. Or:   csm (for interactive TUI)"
    echo ""
    echo "Inside Claude Code, you can now use:"
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
    setup_shell
    install_skill
    show_final_message
}

# Ejecutar
main "$@"
