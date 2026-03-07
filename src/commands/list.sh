#!/bin/bash
# list.sh - Listar sesiones de Claude Code

# cmd_list - Listar todas las sesiones
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
	printf "%-2s %-12s %-8s %-35s %s\n" "" "ID" "SIZE" "DESCRIPTION" "TOOLS"
	printf "%s\n" "─────────────────────────────────────────────────────────────────────────"

	# Listar sesiones
	for file in "${session_files[@]}"; do
		[ -f "$file" ] || continue

		local id size desc tools marker age

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
			marker="*"
			color_output "${GREEN}>"
		else
			marker=" "
			echo -n " "
		fi

		# Imprimir línea
		printf " %-11s %-8s %-35s %s\n" "$id" "$size" "$desc" "$tools"

		# Si se pidió solo la actual, salir
		[ "$show_current" = true ] && [[ "$marker" == "*" ]] && break
	done

	printf "%s\n" "─────────────────────────────────────────────────────────────────────────"

	local total
	total=$(ls -1 "$PROJECTS_DIR"/*.jsonl 2>/dev/null | wc -l)
	echo "Total: $total session(s)"

	if [ -n "$current_session" ]; then
		echo "Current session: ${current_session:0:8}"
	fi
}
