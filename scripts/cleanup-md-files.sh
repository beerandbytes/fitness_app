#!/bin/bash
# Script para organizar archivos .md obsoletos de la raíz del proyecto
# Mueve archivos históricos a docs/archive/ para mantener la raíz limpia

set -e

ARCHIVE_DIR="docs/archive/historical"
ROOT_DIR="."

# Crear directorio de archivo si no existe
mkdir -p "$ARCHIVE_DIR"

# Lista de archivos a archivar (mantener los importantes en la raíz)
IMPORTANT_FILES=(
    "README.md"
    "CHANGELOG.md"
    "CONTRIBUTING.md"
    "LICENSE.md"
    "ANALISIS_Y_MEJORAS.md"
    "MEJORAS_SEGURIDAD.md"
    "REVISION_COMPLETA_PROYECTO.md"
    "RESUMEN_REVISION_FINAL.md"
    "RESUMEN_FINAL_MEJORAS.md"
    "RESUMEN_MEJORAS_IMPLEMENTADAS.md"
)

echo "📦 Organizando archivos .md históricos..."

# Contador de archivos movidos
MOVED_COUNT=0

# Mover archivos .md que no están en la lista de importantes
for file in "$ROOT_DIR"/*.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # Verificar si el archivo NO está en la lista de importantes
        is_important=false
        for important in "${IMPORTANT_FILES[@]}"; do
            if [ "$filename" == "$important" ]; then
                is_important=true
                break
            fi
        done
        
        # Si no es importante, moverlo al archivo
        if [ "$is_important" == false ]; then
            echo "  📄 Moviendo: $filename"
            mv "$file" "$ARCHIVE_DIR/"
            ((MOVED_COUNT++))
        else
            echo "  ✅ Manteniendo: $filename"
        fi
    fi
done

echo ""
echo "✅ Proceso completado. $MOVED_COUNT archivos movidos a $ARCHIVE_DIR"
echo "📝 Los archivos importantes se mantienen en la raíz del proyecto"

