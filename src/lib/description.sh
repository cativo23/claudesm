#!/bin/bash
# description.sh - Generar descripción de sesiones

# get_top_tools - Obtener herramientas más usadas en la sesión
# Retorna formato: B:45 E:12 (Bash:45, Edit:12)
get_top_tools() {
	local file="$1"
	local tools

	# Extraer tipos de tool y contar
	tools=$(grep -o '"tool_name":"[^"]*"' "$file" 2>/dev/null |
		sed 's/"tool_name":"//;s/"//' |
		sort | uniq -c | sort -rn | head -3)

	if [ -z "$tools" ]; then
		echo ""
		return
	fi

	# Formatear output
	echo "$tools" | while read -r count name; do
		# Obtener primera letra
		local initial
		initial=$(echo "$name" | cut -c1 | tr '[:lower:]' '[:upper:]')
		echo -n "${initial}:${count} "
	done
}

# generate_description - Generar descripción para una sesión
# Combina: primer mensaje + herramientas usadas
generate_description() {
	local file="$1"
	local max_len="${2:-40}"
	local first_msg
	local desc

	# Obtener primer mensaje
	first_msg=$(get_first_message "$file")

	if [ -z "$first_msg" ]; then
		# Fallback: usar nombre del archivo
		desc=$(basename "$file" .jsonl | cut -d'-' -f1)
	else
		# Limpiar y truncar
		desc=$(echo "$first_msg" |
			sed 's/^[[:space:]]*//;s/[[:space:]]*$//' |
			sed 's/"//g' |
			head -c "$max_len")

		# Agregar ... si se truncó
		if [ ${#first_msg} -gt "$max_len" ]; then
			desc="${desc}..."
		fi
	fi

	echo "$desc"
}

# format_tools_line - Formatear línea de herramientas
format_tools_line() {
	local file="$1"
	local tools_str

	tools_str=$(get_top_tools "$file")

	if [ -n "$tools_str" ]; then
		echo "[$tools_str]"
	else
		echo ""
	fi
}
