#!/bin/bash
# common.sh - Utilidades comunes para Claude Session Manager

# Directorios de Claude Code
# Usar la ruta completa del home para el directorio de proyectos
PROJECTS_DIR="$HOME/.claude/projects/-home-$(whoami)"
# shellcheck disable=SC2034 # META_DIR reserved for future use
META_DIR="$HOME/.claude/usage-data/session-meta"

# Si no existe, intentar con el formato alternativo
if [ ! -d "$PROJECTS_DIR" ]; then
	# Intentar encontrar el directorio de proyectos
	for dir in "$HOME"/.claude/projects/-*; do
		if [ -d "$dir" ] && [ -n "$(ls -A "$dir"/*.jsonl 2>/dev/null)" ]; then
			PROJECTS_DIR="$dir"
			break
		fi
	done
fi

# die - Mostrar error y salir
die() {
	echo "Error: $*" >&2
	exit 1
}

# get_current_session - Obtener ID de sesión actual
get_current_session() {
	# Priorizar variable de entorno
	[ -n "$CLAUDE_SESSION_ID" ] && echo "$CLAUDE_SESSION_ID" && return 0

	# Intentar leer archivo de sesión actual
	if [ -f "$HOME/.claude/current-session" ]; then
		cat "$HOME/.claude/current-session"
		return 0
	fi

	# No hay sesión actual
	return 1
}

# find_session - Buscar sesión por ID parcial
# Retorna el ID completo si lo encuentra, empty si no
find_session() {
	local partial="$1"

	[ -z "$partial" ] && return 1

	# Buscar coincidencia exacta primero
	if [ -f "$PROJECTS_DIR/$partial.jsonl" ]; then
		echo "$partial"
		return 0
	fi

	# Buscar coincidencia parcial
	for f in "$PROJECTS_DIR"/*.jsonl; do
		[ -f "$f" ] || continue
		local full_id
		full_id=$(basename "$f" .jsonl)
		if [[ "$full_id" == *"$partial"* ]]; then
			echo "$full_id"
			return 0
		fi
	done

	return 1
}

# get_first_message - Obtener el primer mensaje del usuario
# Usado para generar descripción de la sesión
get_first_message() {
	local file="$1"
	local content

	# Buscar primer mensaje de tipo "user"
	content=$(grep -m1 '"type":"user"' "$file" 2>/dev/null |
		sed 's/.*"content":"\([^"]*\)".*/\1/' |
		head -c 100)

	# Limpiar contenido
	echo "$content" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

# get_session_size - Obtener tamaño del archivo de sesión
get_session_size() {
	local file="$1"
	if [ -f "$file" ]; then
		du -h "$file" 2>/dev/null | cut -f1
	else
		echo "N/A"
	fi
}

# get_file_age_days - Obtener edad del archivo en días
get_file_age_days() {
	local file="$1"
	if [ -f "$file" ]; then
		local now
		local mtime
		now=$(date +%s)
		mtime=$(stat -c %Y "$file" 2>/dev/null)
		echo $(((now - mtime) / 86400))
	else
		echo "0"
	fi
}

# truncate - Truncar texto a longitud máxima
truncate() {
	local text="$1"
	local max_len="${2:-50}"

	if [ ${#text} -gt "$max_len" ]; then
		echo "${text:0:$((max_len - 3))}..."
	else
		echo "$text"
	fi
}
