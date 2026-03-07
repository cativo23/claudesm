#!/bin/bash
# resume.sh - Mostrar comando para resumir sesión

# cmd_resume - Mostrar comando para resumir una sesión
cmd_resume() {
	local id="$1"

	# Validar ID
	if [ -z "$id" ]; then
		die "Usage: csm resume <session-id>"
	fi

	# Buscar sesión
	local full_id
	full_id=$(find_session "$id")

	if [ -z "$full_id" ]; then
		die "Session not found: $id"
	fi

	local short_id
	short_id=$(echo "$full_id" | cut -d'-' -f1)

	# Mostrar información
	print_header "Resume Session: $short_id"

	echo ""
	echo "To resume this session in Claude Code, run:"
	echo ""
	color_output "${CYAN}  claude --resume $full_id${NC}"
	echo ""
	echo "Or copy the session ID:"
	echo "  $full_id"
	echo ""
}
