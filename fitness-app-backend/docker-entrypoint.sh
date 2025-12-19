#!/bin/sh
set -e

echo "🚀 Iniciando aplicación..."

# Ejecutar migraciones
echo "📦 Ejecutando migraciones de base de datos..."
npm run db:migrate || {
    echo "⚠️  Advertencia: Las migraciones fallaron, pero continuando..."
}

# NOTA: Los seeds (ejercicios y alimentos) se ejecutan durante el BUILD en render.yaml
# No se ejecutan aquí para evitar bloquear el inicio del servidor
# Si necesitas ejecutar seeds manualmente después del despliegue:
#   npm run seed:all

# Verificar variables de entorno críticas
echo "🔍 Verificando variables de entorno..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET no está configurada"
    exit 1
fi

if [ -n "$ADMIN_EMAILS" ]; then
    echo "✅ ADMIN_EMAILS configurada: $(echo $ADMIN_EMAILS | cut -c1-50)..."
else
    echo "⚠️  ADVERTENCIA: ADMIN_EMAILS no está configurada. Los usuarios no serán marcados como admin automáticamente."
fi

# Iniciar el servidor
echo "✅ Iniciando servidor..."
exec node index.js

