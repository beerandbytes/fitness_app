# Dockerfile para el Backend (Optimizado)
# Multi-stage build para reducir tamaño de imagen final

# Stage 1: Dependencies
# Actualizado a Node.js 24.x (LTS 2025) para seguridad y compatibilidad
FROM node:24-alpine AS deps

# Instalar dependencias del sistema necesarias para compilación de módulos nativos (bcrypt, etc.)
RUN apk add --no-cache \
    bash \
    python3 \
    make \
    g++

WORKDIR /app

# Copiar solo archivos de dependencias para mejor caché de Docker
COPY package.json package-lock.json* ./

# Verificar que package.json existe
RUN test -f package.json || (echo "ERROR: package.json not found!" && exit 1)

# Instalar todas las dependencias (incluyendo dev para herramientas de build)
# No usar --ignore-scripts porque bcrypt necesita compilar módulos nativos
RUN npm install && \
    npm cache clean --force

# Stage 2: Builder (si necesitas compilar algo)
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar el resto del código
COPY . .

# Hacer ejecutable el script de entrada
RUN chmod +x ./docker-entrypoint.sh

# Stage 3: Production
FROM node:24-alpine AS runner

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

# Copiar solo lo necesario desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/index.js ./
COPY --from=builder --chown=nodejs:nodejs /app/db ./db
COPY --from=builder --chown=nodejs:nodejs /app/routes ./routes
COPY --from=builder --chown=nodejs:nodejs /app/middleware ./middleware
COPY --from=builder --chown=nodejs:nodejs /app/config ./config
COPY --from=builder --chown=nodejs:nodejs /app/utils ./utils
COPY --from=builder --chown=nodejs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nodejs:nodejs /app/docker-entrypoint.sh ./

# Cambiar a usuario no-root
USER nodejs

# Exponer el puerto
EXPOSE 4000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Health check - usar endpoint /live que no requiere DB
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD wget --quiet --tries=1 --spider http://localhost:4000/api/health/live || exit 1

# Usar el script de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]

