#!/bin/bash
# status.sh - Mostrar estadísticas de sesiones

# cmd_status - Mostrar estadísticas
cmd_status() {
	print_header "Claude Session Statistics"

	# Verificar directorio
	if [ ! -d "$PROJECTS_DIR" ]; then
		print_warning "No sessions directory found"
		return 1
	fi

	# Contar sesiones
	local total
	total=$(ls -1 "$PROJECTS_DIR"/*.jsonl 2>/dev/null | wc -l)

	# Calcular tamaño total
	local total_size
	total_size=$(du -sh "$PROJECTS_DIR" 2>/dev/null | cut -f1)

	# Contar mensajes totales
	local total_msgs=0
	for f in "$PROJECTS_DIR"/*.jsonl; do
		[ -f "$f" ] || continue
		local lines
		lines=$(wc -l <"$f")
		total_msgs=$((total_msgs + lines))
	done

	# Sesión más antigua y reciente
	local oldest_file=""
	local newest_file=""
	local oldest_time=999999999999
	local newest_time=0

	for f in "$PROJECTS_DIR"/*.jsonl; do
		[ -f "$f" ] || continue
		local mtime
		mtime=$(stat -c %Y "$f" 2>/dev/null)

		if [ "$mtime" -lt "$oldest_time" ]; then
			oldest_time=$mtime
			oldest_file=$f
		fi

		if [ "$mtime" -gt "$newest_time" ]; then
			newest_time=$mtime
			newest_file=$f
		fi
	done

	echo ""
	echo "Total sessions:     $total"
	echo "Total size:         $total_size"
	echo "Total messages:     $total_msgs"

	if [ -n "$oldest_file" ]; then
		local oldest_id oldest_age
		oldest_id=$(basename "$oldest_file" .jsonl | cut -d'-' -f1)
		oldest_age=$(get_file_age_days "$oldest_file")
		echo "Oldest session:     $oldest_id ($oldest_age days ago)"
	fi

	if [ -n "$newest_file" ]; then
		local newest_id newest_age
		newest_id=$(basename "$newest_file" .jsonl | cut -d'-' -f1)
		newest_age=$(get_file_age_days "$newest_file")
		echo "Newest session:     $newest_id ($newest_age days ago)"
	fi

	# Sesión actual
	local current
	current=$(get_current_session)
	if [ -n "$current" ]; then
		echo ""
		echo "Current session:    ${current:0:8}"
	fi

	echo ""
}
