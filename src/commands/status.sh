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
	local total=0
	shopt -s nullglob
	local files=("$PROJECTS_DIR"/*.jsonl)
	total=${#files[@]}
	shopt -u nullglob

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
		if stat -c %Y "$f" &>/dev/null; then
			mtime=$(stat -c %Y "$f")
		else
			mtime=$(stat -f %m "$f" 2>/dev/null || echo 0)
		fi

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
	color_output "  ${BOLD}${CYAN}Total sessions:${NC}     ${WHITE}$total${NC}"
	color_output "  ${BOLD}${CYAN}Total size:${NC}         ${WHITE}$total_size${NC}"
	color_output "  ${BOLD}${CYAN}Total messages:${NC}     ${WHITE}$total_msgs${NC}"

	if [ -n "$oldest_file" ]; then
		local oldest_id oldest_age
		oldest_id=$(basename "$oldest_file" .jsonl | cut -d'-' -f1)
		oldest_age=$(get_file_age_days "$oldest_file")
		color_output "  ${BOLD}${CYAN}Oldest session:${NC}     ${WHITE}$oldest_id${NC} ${DIM}($oldest_age days ago)${NC}"
	fi

	if [ -n "$newest_file" ]; then
		local newest_id newest_age
		newest_id=$(basename "$newest_file" .jsonl | cut -d'-' -f1)
		newest_age=$(get_file_age_days "$newest_file")
		color_output "  ${BOLD}${CYAN}Newest session:${NC}     ${WHITE}$newest_id${NC} ${DIM}($newest_age days ago)${NC}"
	fi

	# Sesión actual
	local current
	current=$(get_current_session)
	if [ -n "$current" ]; then
		echo ""
		color_output "  ${BOLD}${GREEN}Current session:${NC}    ${WHITE}${current:0:8}${NC}"
	fi

	echo ""
}
