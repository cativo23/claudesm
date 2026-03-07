#!/bin/bash
# remove.sh - Eliminar sesión específica

# cmd_remove - Eliminar una sesión por ID
cmd_remove() {
	local id="$1"
	local force=false

	# Parsear argumentos
	shift 2>/dev/null || true
	while [[ $# -gt 0 ]]; do
		case $1 in
		--force | -f)
			force=true
			shift
			;;
		*)
			shift
			;;
		esac
	done

	# Validar ID
	if [ -z "$id" ]; then
		die "Usage: csm remove <session-id> [--force]"
	fi

	# Buscar sesión
	local full_id
	full_id=$(find_session "$id")

	if [ -z "$full_id" ]; then
		die "Session not found: $id"
	fi

	# Verificar si es sesión actual
	local current_session
	current_session=$(get_current_session)

	if [[ "$full_id" == "$current_session" ]]; then
		die "Cannot remove current session. Exit Claude first."
	fi

	# Confirmar eliminación
	local short_id
	short_id=$(echo "$full_id" | cut -d'-' -f1)

	if [ "$force" != true ]; then
		echo -n "Remove session $short_id? [y/N] "
		read -r confirm
		if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
			echo "Cancelled"
			return 0
		fi
	fi

	# Eliminar archivos
	rm -f "$PROJECTS_DIR/$full_id.jsonl"
	rm -f "$META_DIR/$full_id.json" 2>/dev/null

	print_success "Removed session: $short_id"
}
