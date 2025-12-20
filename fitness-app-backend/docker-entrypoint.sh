#!/bin/sh

echo "🚀 Iniciando aplicación..."

# Ejecutar migraciones (no bloquea si fallan)
echo "📦 Ejecutando migraciones de base de datos..."
npm run db:migrate 2>&1 || {
    echo "⚠️  Advertencia: Las migraciones fallaron. Intentando parche manual..."
    node scripts/fix_exercises_schema.js 2>&1 || echo "❌ El parche manual también falló."
}

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

# Iniciar el servidor (siempre ejecuta, incluso si las migraciones fallaron)
echo "✅ Iniciando servidor en puerto ${PORT:-4000}..."
exec node index.js

