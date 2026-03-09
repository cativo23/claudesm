#!/bin/bash
# colors.sh - Colores y formato para output

# Colores básicos
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[0;37m'
GRAY='\033[0;90m'

# Estilos
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'
UNDERLINE='\033[4m'
INVERT='\033[7m'
NC='\033[0m' # No Color

# Colores de fondo (Background)
BG_BLACK='\033[40m'
BG_BLUE='\033[44m'
BG_GRAY='\033[100m'

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
	local width="${2:-75}"
	local line=""

	# Crear línea de separación
	for ((i = 0; i < width; i++)); do
		line="${line}─"
	done

	echo ""
	color_output "${BOLD}${CYAN}╭${line}╮${NC}"

	# Centrar el texto
	local padding=$(( (width - ${#text}) / 2 ))
	local left_pad=$(printf '%*s' $padding '')
	local right_pad=$(printf '%*s' $((width - padding - ${#text})) '')

	color_output "${BOLD}${CYAN}│${NC}${BOLD}${WHITE}${left_pad}${text}${right_pad}${NC}${BOLD}${CYAN}│${NC}"
	color_output "${BOLD}${CYAN}╰${line}╯${NC}"
	echo ""
}
