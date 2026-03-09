#!/bin/bash
# tui.sh - TUI interactivo para Claude Session Manager

# cmd_tui - Interfaz principal
cmd_tui() {
	# Verificar si tiene fzf
	if command -v fzf &>/dev/null; then
		tui_with_fzf
	else
		tui_basic
	fi
}

# tui_with_fzf - TUI con fzf (mejor experiencia)
tui_with_fzf() {
	while true; do
		clear
		print_header "Claude Session Manager (csm)"
		echo ""

		# Obtener sesiones
		local sessions=()
		local current_session
		current_session=$(get_current_session)

		for file in "$PROJECTS_DIR"/*.jsonl; do
			[ -f "$file" ] || continue

			local id size desc marker age color_id color_age
			id=$(basename "$file" .jsonl | cut -d'-' -f1)
			size=$(get_session_size "$file")
			desc=$(generate_description "$file" 40)
			age=$(get_file_age_days "$file")

			if [[ "$(basename "$file" .jsonl)" == "$current_session" ]]; then
				marker="${GREEN}▶${NC}"
				color_id="${GREEN}${BOLD}${id}${NC}"
			else
				marker=" "
				color_id="${CYAN}${id}${NC}"
			fi

			if [ "$age" -gt 7 ]; then
				color_age="${YELLOW}[${age}d]${NC}"
			else
				color_age="${DIM}[${age}d]${NC}"
			fi

			sessions+=("$marker $color_id  ${WHITE}$(printf '%-6s' "$size")${NC}  ${DIM}${desc:0:40}$(printf '%*s' $((40 - ${#desc})) '')${NC}  $color_age")
		done

		color_output "${BOLD}${WHITE}  SESSIONS${NC}"
		color_output "${GRAY} ────────────────────────────────────────────────────────────────────────${NC}"

		# Mostrar sesiones
		for s in "${sessions[@]}"; do
			color_output "  $s"
		done

		echo ""
		color_output "${BOLD}${WHITE}  ACTIONS${NC}"
		color_output "${GRAY} ────────────────────────────────────────────────────────────────────────${NC}"
		color_output "  ${CYAN}[l]${NC} List sessions    ${CYAN}[c]${NC} Clean old sessions"
		color_output "  ${CYAN}[r]${NC} Remove session   ${CYAN}[s]${NC} Show status"
		color_output "  ${CYAN}[h]${NC} Help             ${CYAN}[q]${NC} Quit"
		echo ""
		color_output -n "  ${BOLD}Select action: ${NC}"

		read -r action

		case $action in
		l | L)
			echo ""
			cmd_list
			echo ""
			echo "Press Enter to continue..."
			read -r
			;;
		c | C)
			echo ""
			echo -n "Days threshold [default: $CSM_CLEAN_DAYS]: "
			read -r days_input
			local days="${days_input:-$CSM_CLEAN_DAYS}"
			cmd_clean --days "$days" --force
			echo ""
			echo "Press Enter to continue..."
			read -r
			;;
		r | R)
			echo ""
			echo -n "Session ID to remove: "
			read -r session_id
			if [ -n "$session_id" ]; then
				cmd_remove "$session_id" --force
			fi
			echo ""
			echo "Press Enter to continue..."
			read -r
			;;
		s | S)
			echo ""
			cmd_status
			echo ""
			echo "Press Enter to continue..."
			read -r
			;;
		h | H)
			echo ""
			cmd_help
			echo ""
			echo "Press Enter to continue..."
			read -r
			;;
		q | Q)
			clear
			echo "Goodbye!"
			return 0
			;;
		*)
			echo "Invalid option: $action"
			sleep 1
			;;
		esac
	done
}

# tui_basic - TUI básico con select de bash (fallback sin fzf)
tui_basic() {
	print_info "Using basic TUI (install fzf for better experience)"
	echo ""

	while true; do
		echo ""
		print_header "Claude Session Manager (csm)"
		echo ""

		PS3=$(color_output "\n${BOLD}${CYAN}Select action: ${NC}")
		options=("List sessions" "Clean old sessions" "Remove session" "Show status" "Help" "Quit")
		select opt in "${options[@]}"; do
			case $opt in
			"List sessions")
				cmd_list
				;;
			"Clean old sessions")
				echo -n "Days threshold [default: $CSM_CLEAN_DAYS]: "
				read -r days_input
				local days="${days_input:-$CSM_CLEAN_DAYS}"
				cmd_clean --days "$days" --force
				;;
			"Remove session")
				echo -n "Session ID to remove: "
				read -r session_id
				if [ -n "$session_id" ]; then
					cmd_remove "$session_id" --force
				fi
				;;
			"Show status")
				cmd_status
				;;
			"Help")
				cmd_help
				;;
			"Quit")
				clear
				echo "Goodbye!"
				return 0
				;;
			esac
			break
		done
	done
}
