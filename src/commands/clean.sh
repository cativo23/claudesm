#!/bin/bash
# clean.sh - Limpiar sesiones viejas

# cmd_clean - Eliminar sesiones antiguas
cmd_clean() {
    local days="${CSM_CLEAN_DAYS:-7}"
    local force=false
    local dry_run=false

    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --days)
                days="$2"
                shift 2
                ;;
            --force|-f)
                force=true
                shift
                ;;
            --dry-run|-n)
                dry_run=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    # Verificar directorio
    if [ ! -d "$PROJECTS_DIR" ]; then
        print_warning "No sessions directory found"
        return 1
    fi

    local current_session
    current_session=$(get_current_session)

    local removed=0
    local skipped=0

    print_info "Cleaning sessions older than $days days..."

    for file in "$PROJECTS_DIR"/*.jsonl; do
        [ -f "$file" ] || continue

        local full_id age

        full_id=$(basename "$file" .jsonl)
        age=$(get_file_age_days "$file")

        # Skip sesión actual
        if [[ "$full_id" == "$current_session" ]]; then
            ((skipped++))
            continue
        fi

        # Verificar edad
        if [ "$age" -ge "$days" ]; then
            local short_id
            short_id=$(echo "$full_id" | cut -d'-' -f1)

            if [ "$dry_run" = true ]; then
                echo "Would remove: $short_id ($age days old)"
            elif [ "$force" = true ]; then
                rm -f "$file"
                # También intentar remover metadata
                rm -f "$META_DIR/$full_id.json" 2>/dev/null
                ((removed++))
                print_success "Removed: $short_id"
            else
                # Modo interactivo
                echo -n "Remove $short_id? ($age days old) [y/N] "
                read -r confirm
                if [[ "$confirm" =~ ^[Yy]$ ]]; then
                    rm -f "$file"
                    rm -f "$META_DIR/$full_id.json" 2>/dev/null
                    ((removed++))
                    print_success "Removed: $short_id"
                else
                    ((skipped++))
                fi
            fi
        fi
    done

    echo ""
    if [ "$dry_run" = true ]; then
        echo "Dry run complete. No files were removed."
    else
        echo "Summary: Removed $removed session(s), skipped $skipped"
    fi
}
