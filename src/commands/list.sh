#!/bin/bash
# list.sh - Listar sesiones de Claude Code

# cmd_list - Listar todas las sesiones
# shellcheck disable=SC2034
cmd_list() {
	local show_all=false
	local show_current=false

	# Parsear argumentos
	while [[ $# -gt 0 ]]; do
		case $1 in
		--all | -a)
			show_all=true
			shift
			;;
		--current | -c)
			show_current=true
			shift
			;;
		*) shift ;;
		esac
	done

	# Verificar directorio de proyectos
	if [ ! -d "$PROJECTS_DIR" ]; then
		print_warning "No sessions directory found at $PROJECTS_DIR"
		return 1
	fi

	# Contar sesiones
	local session_files
	session_files=("$PROJECTS_DIR"/*.jsonl)

	if [ ! -f "${session_files[0]}" ]; then
		print_info "No sessions found"
		return 0
	fi

	local current_session
	current_session=$(get_current_session)

	# Header
	color_output "  ${BOLD}${GRAY}ID${NC}          ${BOLD}${GRAY}SIZE${NC}     ${BOLD}${GRAY}DESCRIPTION${NC}                         ${BOLD}${GRAY}TOOLS${NC}"
	color_output "${GRAY} ────────────────────────────────────────────────────────────────────────${NC}"

	# Listar sesiones
	for file in "${session_files[@]}"; do
		[ -f "$file" ] || continue

		local id size desc tools marker age
		local c_id c_size c_desc c_tools c_age

		# Obtener ID (primeros 8 caracteres del UUID)
		id=$(basename "$file" .jsonl | cut -d'-' -f1)

		# Obtener tamaño
		size=$(get_session_size "$file")

		# Obtener descripción
		desc=$(generate_description "$file" 35)

		# Obtener herramientas
		tools=$(format_tools_line "$file")

		# Obtener edad
		age=$(get_file_age_days "$file")

		# Marcar sesión actual
		if [[ "$(basename "$file" .jsonl)" == "$current_session" ]]; then
			marker="${GREEN}▶${NC}"
			c_id="${GREEN}${BOLD}${id}${NC}"
		else
			marker=" "
			c_id="${CYAN}${id}${NC}"
		fi

		# Skip hidden sessions unless --all is specified
		[[ "$show_all" = false && "$id" == .* ]] && continue

		c_size="${WHITE}$(printf '%-6s' "$size")${NC}"
		c_desc="${DIM}${desc:0:35}$(printf '%*s' $((35 - ${#desc})) '')${NC}"

		if [ "$age" -gt 7 ]; then
			c_age="${YELLOW}[${age}d]${NC}"
		else
			c_age="${DIM}[${age}d]${NC}"
		fi

		c_tools="${WHITE}${tools}${NC}"

		# Imprimir línea
		color_output "$marker $c_id  $c_size  $c_desc  $c_tools $c_age"

		# Si se pidió solo la actual, salir
		[ "$show_current" = true ] && [[ "$marker" == "${GREEN}▶${NC}" ]] && break
	done

	color_output "${GRAY} ────────────────────────────────────────────────────────────────────────${NC}"

	local total=0
	shopt -s nullglob
	local files=("$PROJECTS_DIR"/*.jsonl)
	total=${#files[@]}
	shopt -u nullglob

	echo "Total: $total session(s)"

	if [ -n "$current_session" ]; then
		echo "Current session: ${current_session:0:8}"
	fi
}
