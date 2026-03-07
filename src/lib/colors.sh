#!/bin/bash
# colors.sh - Colores y formato para output

# Colores básicos
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Verificar si la salida es un TTY
is_tty() {
    [ -t 1 ]
}

# Colores condicionales (solo si es TTY)
color_output() {
    if is_tty; then
        echo -e "$1"
    else
        # Strip ANSI codes for non-TTY
        echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g'
    fi
}

# Funciones de output con formato
print_success() {
    color_output "${GREEN}✓ $*${NC}"
}

print_error() {
    color_output "${RED}✗ $*${NC}"
}

print_warning() {
    color_output "${YELLOW}⚠ $*${NC}"
}

print_info() {
    color_output "${BLUE}ℹ $*${NC}"
}

print_header() {
    local text="$1"
    local width="${2:-60}"
    local line=""

    # Crear línea de separación
    for ((i=0; i<width; i++)); do
        line="${line}─"
    done

    echo ""
    color_output "${BOLD}${text}${NC}"
    color_output "${CYAN}${line}${NC}"
}
