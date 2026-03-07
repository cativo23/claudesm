#!/bin/bash
# csm.sh - Claude Session Manager
# Entry point principal

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cargar librerías
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"
# shellcheck source=lib/colors.sh
source "$SCRIPT_DIR/lib/colors.sh"
# shellcheck source=lib/description.sh
source "$SCRIPT_DIR/lib/description.sh"

# Cargar configuración del usuario
load_config "$HOME/.csmrc"

# Cargar comandos
# shellcheck source=commands/list.sh
source "$SCRIPT_DIR/commands/list.sh"
# shellcheck source=commands/clean.sh
source "$SCRIPT_DIR/commands/clean.sh"
# shellcheck source=commands/remove.sh
source "$SCRIPT_DIR/commands/remove.sh"
# shellcheck source=commands/resume.sh
source "$SCRIPT_DIR/commands/resume.sh"
# shellcheck source=commands/status.sh
source "$SCRIPT_DIR/commands/status.sh"
# shellcheck source=commands/help.sh
source "$SCRIPT_DIR/commands/help.sh"
# shellcheck source=commands/tui.sh
source "$SCRIPT_DIR/commands/tui.sh"

# Mostrar versión
show_version() {
    echo "csm (Claude Session Manager) v1.0.0"
}

# Punto de entrada principal
main() {
    local cmd="${1:-tui}"

    # Manejar opciones globales
    case "$cmd" in
        --version|-V)
            show_version
            exit 0
            ;;
        --help|-h|help)
            cmd_help
            exit 0
            ;;
    esac

    shift 2>/dev/null || true

    # Ejecutar comando
    case "$cmd" in
        list)
            cmd_list "$@"
            ;;
        clean)
            cmd_clean "$@"
            ;;
        remove)
            cmd_remove "$@"
            ;;
        resume)
            cmd_resume "$@"
            ;;
        status)
            cmd_status "$@"
            ;;
        tui|*)
            cmd_tui
            ;;
    esac
}

# Ejecutar main
main "$@"
