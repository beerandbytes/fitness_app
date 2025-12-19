# Dockerfile para el Frontend (Multi-stage build optimizado)
# Stage 1: Dependencies
# Actualizado a Node.js 24.x (LTS 2025) para seguridad y compatibilidad
FROM node:24-alpine AS deps

# Instalar dependencias del sistema necesarias para Tailwind CSS v4 y otras dependencias nativas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

WORKDIR /app

# Copiar solo archivos de dependencias para mejor caché de Docker
COPY package.json package-lock.json* ./

# Verificar que package.json existe
RUN test -f package.json || (echo "ERROR: package.json not found!" && exit 1)

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Stage 2: Builder
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar archivos de configuración primero (mejor caché)
COPY package.json package-lock.json* ./
COPY vite.config.js tailwind.config.js tsconfig.json ./
COPY index.html ./

# Copiar el resto del código
COPY src ./src
COPY public ./public

# Construir la aplicación
# VITE_API_URL se puede pasar como build arg O como variable de entorno
# Render pasa las variables de entorno, pero no como build args automáticamente
# Por eso aceptamos ambos métodos
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
# Si VITE_API_URL no está definida, mostrar advertencia pero continuar
RUN if [ -z "$VITE_API_URL" ]; then \
        echo "⚠️  ADVERTENCIA: VITE_API_URL no está definida. La aplicación usará localhost:4000 por defecto."; \
        echo "⚠️  Para producción, configura VITE_API_URL en Render como variable de entorno."; \
    else \
        echo "✅ VITE_API_URL configurada: $VITE_API_URL"; \
    fi
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS runner

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear configuración de nginx optimizada para SPA
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Cache para assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy para API - redirige /api/* al backend
    location /api/ {
        proxy_pass http://backend:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

