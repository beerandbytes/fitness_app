# 🐳 Guía de Despliegue con Docker

Esta guía te ayudará a desplegar tu aplicación completa usando Docker, tanto para desarrollo local como para producción en Render.com.

## 📋 Requisitos Previos

1. **Docker** instalado: [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. **Docker Compose** (incluido en Docker Desktop)
3. **Cuenta en Render.com** (para producción)

---

## 🏠 Desarrollo Local con Docker

### Opción 1: Docker Compose (Recomendado)

1. **Clona o navega a tu proyecto**

2. **Crea un archivo `.env` en la raíz** (opcional, para personalizar):
```env
POSTGRES_DB=fitnessdb
POSTGRES_USER=fitnessuser
POSTGRES_PASSWORD=fitnesspass
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_minimo_32_caracteres
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:4000/api
```

3. **Inicia todos los servicios**:
```bash
docker-compose up -d
```

4. **Verifica que todo esté funcionando**:
```bash
# Ver logs
docker-compose logs -f

# Verificar servicios
docker-compose ps
```

5. **Accede a la aplicación**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000
   - API: http://localhost:4000/api

### Opción 2: Construir y Ejecutar Manualmente

#### Backend
```bash
cd fitness-app-backend
docker build -t fitness-backend .
docker run -p 4000:4000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=tu_secreto \
  -e FRONTEND_URL=http://localhost:5173 \
  fitness-backend
```

#### Frontend
```bash
cd fitness-app-frontend
docker build --build-arg VITE_API_URL=http://localhost:4000/api -t fitness-frontend .
docker run -p 5173:80 fitness-frontend
```

---

## 🚀 Despliegue en Render.com con Docker

Render.com soporta Docker nativamente. Puedes desplegar usando Dockerfiles.

### Opción 1: Desplegar Backend con Docker

1. **Ve a Render Dashboard → New + → Web Service**

2. **Conecta tu repositorio**

3. **Configura el servicio**:
   - **Name**: `fitness-app-backend`
   - **Environment**: `Docker`
   - **Root Directory**: `fitness-app-backend`
   - **Dockerfile Path**: `Dockerfile` (debe ser relativo al Root Directory)
   - **Plan**: `Free`
   
   **IMPORTANTE**: Si el Root Directory es `fitness-app-backend`, el Dockerfile Path debe ser solo `Dockerfile` (no `fitness-app-backend/Dockerfile`), porque Render usa el Root Directory como el build context.

4. **Crea la base de datos PostgreSQL** (si no la tienes):
   - Dashboard → New + → PostgreSQL
   - Name: `fitness-app-db`
   - Plan: `Free`

5. **Configura variables de entorno**:
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<Internal Database URL de Render>
JWT_SECRET=<genera con: openssl rand -base64 32>
FRONTEND_URL=https://tu-frontend.onrender.com
```

6. **Link Database**: Conecta la base de datos al servicio

7. **Despliega**

### Opción 2: Desplegar Frontend con Docker

1. **Ve a Render Dashboard → New + → Web Service**

2. **Conecta tu repositorio**

3. **Configura el servicio**:
   - **Name**: `fitness-app-frontend`
   - **Environment**: `Docker`
   - **Root Directory**: `fitness-app-frontend`
   - **Dockerfile Path**: `Dockerfile` (debe ser relativo al Root Directory)
   - **Plan**: `Free`
   
   **IMPORTANTE**: Si el Root Directory es `fitness-app-frontend`, el Dockerfile Path debe ser solo `Dockerfile` (no `fitness-app-frontend/Dockerfile`), porque Render usa el Root Directory como el build context.

4. **Configura variables de entorno** (Build Args):
   - En la sección **Environment Variables**, agrega:
   ```env
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```

5. **Despliega**

### Opción 3: Usar Static Site (Más Eficiente para Frontend)

Para el frontend, Render recomienda usar **Static Site** en lugar de Docker, ya que es más eficiente:

1. **Ve a Render Dashboard → New + → Static Site**

2. **Conecta tu repositorio**

3. **Configura**:
   - **Root Directory**: `fitness-app-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```env
     VITE_API_URL=https://tu-backend.onrender.com/api
     ```

---

## 🐳 Comandos Docker Útiles

### Desarrollo

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (limpia la base de datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ejecutar comandos en contenedores
docker-compose exec backend npm run db:migrate
docker-compose exec backend sh

# Ver estado de servicios
docker-compose ps
```

### Producción

```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🔧 Optimizaciones del Dockerfile

### Backend - Multi-stage Build (Opcional)

Si quieres optimizar el tamaño de la imagen del backend:

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["sh", "-c", "npm run db:migrate && node index.js"]
```

### Frontend - Ya está optimizado

El Dockerfile del frontend ya usa multi-stage build para minimizar el tamaño final.

---

## 🗄️ Base de Datos

### Desarrollo Local

La base de datos se crea automáticamente con `docker-compose up`. Los datos se persisten en un volumen Docker.

### Producción en Render

Usa el servicio PostgreSQL de Render (gratis) y conéctalo mediante la Internal Database URL.

---

## 🔐 Variables de Entorno

### Desarrollo (docker-compose.yml)

Las variables están definidas directamente en el archivo `docker-compose.yml`.

### Producción

Usa variables de entorno en Render.com o crea un archivo `.env` para `docker-compose.prod.yml`:

```env
POSTGRES_DB=fitnessdb
POSTGRES_USER=fitnessuser
POSTGRES_PASSWORD=tu_password_seguro
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_minimo_32_caracteres
FRONTEND_URL=https://tu-frontend.onrender.com
VITE_API_URL=https://tu-backend.onrender.com/api
```

Luego ejecuta:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env up -d
```

---

## 🚨 Solución de Problemas

### Error: "Cannot connect to database"

- Verifica que el servicio `postgres` esté corriendo: `docker-compose ps`
- Verifica la `DATABASE_URL` en las variables de entorno
- Espera a que la base de datos esté lista: `docker-compose logs postgres`

### Error: "Port already in use"

- Cambia los puertos en `docker-compose.yml`:
  ```yaml
  ports:
    - "4001:4000"  # Cambia 4000 por otro puerto
  ```

### Error: "Migration failed"

- Ejecuta las migraciones manualmente:
  ```bash
  docker-compose exec backend npm run db:migrate
  ```

### El frontend no se conecta al backend

- Verifica que `VITE_API_URL` esté correctamente configurado
- En desarrollo, usa `http://localhost:4000/api`
- En producción, usa la URL completa del backend

### Error: "Could not read package.json: ENOENT: no such file or directory"

Este error ocurre cuando Render no puede encontrar el `package.json` durante la construcción. Verifica:

1. **Configuración de Root Directory y Dockerfile Path en Render**:
   - Si **Root Directory** = `fitness-app-backend`, entonces **Dockerfile Path** = `Dockerfile` (NO `fitness-app-backend/Dockerfile`)
   - Si **Root Directory** = `.` (vacío/raíz), entonces **Dockerfile Path** = `fitness-app-backend/Dockerfile`

2. **Verifica que los archivos existen en el repositorio**:
   - Asegúrate de que `package.json` y `package-lock.json` estén commitados y pusheados al repositorio
   - Verifica en GitHub/GitLab que los archivos existen en la rama que Render está usando

3. **Verifica la configuración del servicio en Render**:
   - Ve a tu servicio en Render Dashboard
   - En la pestaña "Settings", verifica:
     - **Root Directory**: Debe ser `fitness-app-backend` (para backend) o `fitness-app-frontend` (para frontend)
     - **Dockerfile Path**: Debe ser `Dockerfile` (relativo al Root Directory)
     - **Build Context**: Debe estar vacío o ser el mismo que Root Directory

4. **Solución alternativa**: Si el problema persiste, intenta:
   - Dejar **Root Directory** vacío (raíz del repo)
   - Configurar **Dockerfile Path** como `fitness-app-backend/Dockerfile` (ruta completa desde la raíz)
   - Esto usa todo el repositorio como build context

### Limpiar todo y empezar de nuevo

```bash
# Detener y eliminar contenedores, redes y volúmenes
docker-compose down -v

# Eliminar imágenes
docker rmi fitness-backend fitness-frontend

# Limpiar sistema Docker (cuidado: elimina todo)
docker system prune -a --volumes
```

---

## 📊 Ventajas de Docker

✅ **Consistencia**: Mismo entorno en desarrollo y producción  
✅ **Aislamiento**: Cada servicio corre en su propio contenedor  
✅ **Portabilidad**: Funciona en cualquier máquina con Docker  
✅ **Escalabilidad**: Fácil de escalar horizontalmente  
✅ **Versionado**: Puedes versionar tu entorno completo  

---

## 🎯 Comparación: Docker vs Sin Docker

| Aspecto | Sin Docker | Con Docker |
|---------|-----------|------------|
| Configuración inicial | Más compleja | Más simple |
| Consistencia | Depende del sistema | Garantizada |
| Portabilidad | Requiere instalaciones | Solo Docker |
| Desarrollo local | Múltiples servicios | Un comando |
| Producción | Configuración manual | Mismo proceso |

---

## 📝 Checklist de Despliegue

- [ ] Docker instalado y funcionando
- [ ] `docker-compose.yml` configurado
- [ ] Variables de entorno configuradas
- [ ] Base de datos funcionando
- [ ] Backend construido y corriendo
- [ ] Frontend construido y corriendo
- [ ] Migraciones ejecutadas
- [ ] Aplicación probada localmente
- [ ] Desplegado en Render.com (producción)
- [ ] URLs de producción configuradas

---

## 🎉 ¡Listo!

Tu aplicación ahora está containerizada y lista para desplegarse en cualquier plataforma que soporte Docker.

**Próximos pasos**:
1. Prueba localmente con `docker-compose up`
2. Despliega en Render.com usando los Dockerfiles
3. Considera usar Docker Hub para almacenar tus imágenes

---

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Render Docker Support](https://render.com/docs/docker)
- [Best Practices for Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)

