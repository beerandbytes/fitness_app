# Guía de Despliegue con Coolify (Instalación Local en WSL)

Esta guía te ayudará a instalar Coolify en WSL y desplegar tu aplicación Fitness App localmente usando docker-compose.

## Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Trabajando desde Windows/WSL](#trabajando-desde-windowswsl)
- [Configuración Inicial en Coolify](#configuración-inicial-en-coolify)
- [Variables de Entorno](#variables-de-entorno)
- [Configuración de Dominio y SSL](#configuración-de-dominio-y-ssl)
- [Despliegue](#despliegue)
- [Verificación Post-Despliegue](#verificación-post-despliegue)
- [Troubleshooting](#troubleshooting)

## Prerrequisitos

### Requisitos del Sistema

1. **Windows 10/11** con WSL 2 instalado
   - Verifica tu versión de WSL: `wsl --version` en PowerShell
   - Si no tienes WSL 2, instálalo: `wsl --install`

2. **Docker Desktop para Windows**
   - Descarga e instala desde [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
   - Asegúrate de tener la integración WSL 2 habilitada

3. **Recursos del Sistema**
   - Mínimo 4GB de RAM disponible para WSL
   - Al menos 10GB de espacio libre en disco
   - CPU con soporte para virtualización

4. **Repositorio Git**
   - Tu código debe estar en un repositorio Git (GitHub, GitLab, Bitbucket, etc.)
   - Puedes trabajar localmente o conectar Coolify a tu repositorio remoto

### Verificar Instalación de WSL

Abre PowerShell como administrador y ejecuta:

```powershell
# Verificar versión de WSL
wsl --version

# Ver distribuciones instaladas
wsl --list --verbose

# Si no tienes WSL 2, instálalo
wsl --install
```

### Verificar Docker Desktop

1. Abre Docker Desktop
2. Ve a **Settings** → **Resources** → **WSL Integration**
3. Habilita la integración con tu distribución WSL (ej: Ubuntu)
4. Haz clic en **Apply & Restart**
5. Verifica desde WSL: `docker ps` debería funcionar sin errores

## Instalación de Coolify en WSL

### Paso 1: Abrir WSL

Abre tu distribución WSL (Ubuntu, Debian, etc.) desde:
- Menú Inicio → Buscar "Ubuntu" o tu distribución
- O desde PowerShell: `wsl`

### Paso 2: Instalar Coolify

Ejecuta el script de instalación oficial:

```bash
# Instalación rápida (recomendada)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Este script:
- Instalará todas las dependencias necesarias
- Configurará Docker
- Iniciará Coolify automáticamente

**Nota:** Durante la instalación, se te pedirá crear una cuenta de administrador. Anota las credenciales.

### Paso 3: Verificar Instalación

```bash
# Verificar que Coolify esté corriendo
docker ps | grep coolify

# Ver los logs de Coolify
docker logs coolify
```

### Paso 4: Acceder a Coolify desde Windows

1. **Abre tu navegador en Windows** (Chrome, Edge, Firefox, etc.)
2. **Accede a:** `http://localhost:8000` o `http://127.0.0.1:8000`
3. **Si es la primera vez**, se te pedirá crear tu cuenta de administrador
4. **Si ya tienes cuenta**, inicia sesión con tus credenciales

**Nota importante:** 
- Coolify debe estar corriendo en WSL para que puedas acceder desde Windows
- Si no puedes acceder, verifica en WSL: `docker ps | grep coolify`
- Si Coolify no está corriendo, inícialo desde WSL (normalmente se inicia automáticamente tras la instalación)
- El puerto 8000 debe estar disponible (no debe estar siendo usado por otra aplicación)

### Paso 5: Configurar Coolify (Primera Vez)

1. **Crear cuenta de administrador** (si es primera vez)
2. **Configurar Git Provider** (opcional pero recomendado):
   - Ve a Settings → Git Providers
   - Conecta tu cuenta de GitHub/GitLab/Bitbucket
   - Esto permitirá que Coolify acceda a tus repositorios

### Trabajando con tu Repositorio

Tienes dos opciones:

#### Opción A: Repositorio Local (Desarrollo Rápido)

Si quieres trabajar con código local sin hacer push a Git:

1. En Coolify, crea un nuevo proyecto
2. Selecciona "Local Git Repository" o "File System"
3. Apunta a la ruta de tu proyecto en WSL (ej: `/home/tu-usuario/fitness-aprendizaje`)

#### Opción B: Repositorio Git Remoto (Recomendado)

Si tu código está en GitHub/GitLab:

1. Conecta tu proveedor Git en Coolify (Settings → Git Providers)
2. Al crear la aplicación, selecciona tu repositorio
3. Coolify clonará y desplegará automáticamente

**Trabajar con Git desde WSL:**

```bash
# Si trabajas localmente primero
cd ~/fitness-aprendizaje  # o donde esté tu proyecto
git add .
git commit -m "Tus cambios"
git push origin main

# Coolify detectará el cambio y desplegará automáticamente (si Auto Deploy está activado)
```

## Configuración Inicial en Coolify

### Paso 1: Crear un Nuevo Proyecto

1. Accede al panel de Coolify
2. Haz clic en **"+ Añadir"** o **"New Project"**
3. Asigna un nombre al proyecto (ej: `fitness-app`)
4. Opcionalmente, añade una descripción

### Paso 2: Conectar Repositorio Git

1. Dentro de tu proyecto, ve a **"Production"** o **"Producción"**
2. Haz clic en **"+ Añadir nuevo recurso"** o **"+ Add Resource"**
3. Selecciona **"Docker Compose"** o **"Application"** → **"Docker Compose"**
4. Conecta tu repositorio Git:
   - Si es la primera vez, conecta tu cuenta de GitHub/GitLab/Bitbucket
   - Selecciona el repositorio que contiene tu proyecto
   - Selecciona la rama (generalmente `main` o `master`)

### Paso 3: Configurar Docker Compose

Coolify puede usar directamente tu archivo `docker-compose.prod.yml`. Configura lo siguiente:

1. **Docker Compose File Path**: `docker-compose.prod.yml`
2. **Root Directory**: Deja vacío (raíz del repositorio)
3. **Build Pack**: Docker Compose

## Variables de Entorno

### Variables Críticas (Requeridas)

Estas variables **DEBEN** estar configuradas para que la aplicación funcione:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Contraseña para PostgreSQL | `tu_password_seguro_aqui` |
| `JWT_SECRET` | Secreto para firmar tokens JWT (mínimo 32 caracteres) | `tu_jwt_secret_minimo_32_caracteres_para_seguridad` |
| `DATABASE_URL` | URL completa de conexión a PostgreSQL | `postgresql://fitnessuser:password@postgres:5432/fitnessdb` |
| `VITE_API_URL` | URL completa del backend API (con protocolo y dominio) | `http://localhost:4000/api` (local) o `https://api.tudominio.com/api` (producción) |
| `FRONTEND_URL` | URL completa del frontend (con protocolo y dominio) | `http://localhost:5173` (local) o `https://tudominio.com` (producción) |

**Nota**: `DATABASE_URL` se construye automáticamente en docker-compose usando las variables de PostgreSQL, pero puedes sobrescribirla si es necesario.

### Variables Opcionales de PostgreSQL

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `POSTGRES_DB` | Nombre de la base de datos | `fitnessdb` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `fitnessuser` |
| `POSTGRES_PORT` | Puerto de PostgreSQL | `5432` |

### Variables Opcionales del Backend

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto del backend | `4000` |
| `BACKEND_PORT` | Puerto expuesto del backend | `4000` |
| `ADMIN_EMAILS` | Lista de emails separados por coma para usuarios admin | (vacío) |
| `SMTP_HOST` | Servidor SMTP para envío de emails | (vacío) |
| `SMTP_PORT` | Puerto del servidor SMTP | (vacío) |
| `SMTP_USER` | Usuario SMTP | (vacío) |
| `SMTP_PASS` | Contraseña SMTP | (vacío) |
| `SMTP_FROM` | Email remitente | (vacío) |

### Variables Opcionales del Frontend

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `FRONTEND_PORT` | Puerto expuesto del frontend | `80` |

### Cómo Configurar Variables de Entorno en Coolify

1. En la configuración de tu aplicación Docker Compose
2. Ve a la sección **"Environment Variables"** o **"Variables de Entorno"**
3. Añade cada variable una por una:
   - Haz clic en **"+ Add"** o **"+ Añadir"**
   - Introduce el nombre de la variable
   - Introduce el valor
   - Marca como **"Secret"** si contiene información sensible
4. Guarda los cambios

**Ejemplo de configuración mínima para localhost:**

```
POSTGRES_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=tu_jwt_secret_minimo_32_caracteres_para_seguridad
VITE_API_URL=http://localhost:4000/api
FRONTEND_URL=http://localhost:5173
```

**Ejemplo de configuración para producción (con dominio real):**

```
POSTGRES_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=tu_jwt_secret_minimo_32_caracteres_para_seguridad
VITE_API_URL=https://api.tudominio.com/api
FRONTEND_URL=https://tudominio.com
```

## Configuración de Dominio y Acceso Local

### Opción 1: Usar localhost (Más Simple)

Para desarrollo local, puedes usar `localhost` con diferentes puertos:

1. **En Coolify**, al configurar tu aplicación Docker Compose:
   - No necesitas configurar dominios personalizados
   - Coolify asignará puertos automáticamente o puedes usar los del docker-compose

2. **Variables de entorno para localhost:**
   ```
   FRONTEND_URL=http://localhost:5173
   VITE_API_URL=http://localhost:4000/api
   ```

3. **Acceso a tus aplicaciones:**
   - Frontend: `http://localhost:5173` (o el puerto que configures)
   - Backend API: `http://localhost:4000/api`
   - Base de datos: Solo accesible desde dentro de Docker

### Opción 2: Usar Dominios Locales con /etc/hosts

Para simular un entorno más realista:

1. **Edita el archivo hosts en Windows:**
   - Abre PowerShell como administrador
   - Edita: `C:\Windows\System32\drivers\etc\hosts`
   - Añade líneas como:
     ```
     127.0.0.1 fitness.local
     127.0.0.1 api.fitness.local
     ```

2. **Configura en Coolify:**
   - Ve a Domains en tu aplicación
   - Añade `fitness.local` para el frontend
   - Añade `api.fitness.local` para el backend

3. **Variables de entorno:**
   ```
   FRONTEND_URL=http://fitness.local
   VITE_API_URL=http://api.fitness.local/api
   ```

### Opción 3: Usar ngrok para Acceso Externo (Opcional)

Si quieres compartir tu aplicación localmente o probar desde otros dispositivos:

1. **Instala ngrok** (desde Windows o WSL):
   ```bash
   # En WSL
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
   tar -xzf ngrok-v3-stable-linux-amd64.tgz
   sudo mv ngrok /usr/local/bin/
   ```

2. **Crea cuenta en ngrok.com** y obtén tu token

3. **Configura ngrok:**
   ```bash
   ngrok config add-authtoken tu-token-aqui
   ```

4. **Expone tu aplicación:**
   ```bash
   # Para el frontend (puerto 5173)
   ngrok http 5173
   
   # Para el backend (puerto 4000) - en otra terminal
   ngrok http 4000
   ```

5. **Usa las URLs de ngrok** en tus variables de entorno:
   ```
   FRONTEND_URL=https://tu-url-ngrok-frontend.ngrok.io
   VITE_API_URL=https://tu-url-ngrok-backend.ngrok.io/api
   ```

**Nota:** Las URLs de ngrok cambian cada vez que lo reinicias (a menos que uses plan de pago).

### SSL en Entorno Local

- **localhost**: No necesitas SSL, funciona con HTTP
- **Dominios locales (.local)**: No necesitas SSL para desarrollo
- **ngrok**: Proporciona HTTPS automáticamente
- **Para producción real**: Necesitarías un servidor remoto con dominio real y SSL

## Despliegue

### Despliegue Inicial

1. **Revisa la configuración**:
   - Verifica que todas las variables críticas estén configuradas
   - Verifica que el archivo `docker-compose.prod.yml` esté en la raíz del repositorio
   - Verifica que los dominios estén configurados correctamente

2. **Habilita despliegue automático (opcional)**:
   - Activa **"Auto Deploy"** si quieres que cada push a la rama principal despliegue automáticamente

3. **Inicia el despliegue**:
   - Haz clic en **"Deploy"** o **"Desplegar"**
   - Coolify comenzará a:
     - Clonar el repositorio
     - Construir las imágenes Docker
     - Iniciar los contenedores
     - Configurar el enrutamiento

4. **Monitorea el proceso**:
   - Ve a la sección **"Logs"** o **"Registros"** para ver el progreso
   - El proceso puede tardar varios minutos en la primera ejecución

### Despliegues Subsecuentes

Si tienes **Auto Deploy** activado:
- Cada push a la rama principal desplegará automáticamente
- Puedes ver el historial de despliegues en la sección correspondiente

Si **Auto Deploy** está desactivado:
- Haz clic en **"Deploy"** manualmente cuando quieras actualizar

## Verificación Post-Despliegue

### 1. Verificar Contenedores

En Coolify, verifica que todos los contenedores estén corriendo:
- `fitness-db-prod` (PostgreSQL)
- `fitness-backend-prod` (Backend API)
- `fitness-frontend-prod` (Frontend)

### 2. Verificar Health Checks

Los health checks deberían mostrar estado "healthy" después de unos minutos:
- PostgreSQL: Verifica conexión a la base de datos
- Backend: Verifica endpoint `/api/health`
- Frontend: Verifica que nginx responda

### 3. Verificar Endpoints

1. **Frontend**: Accede desde tu navegador en Windows:
   - Si usas localhost: `http://localhost:5173` (o el puerto configurado)
   - Si usas dominio local: `http://fitness.local` (o el que configuraste)
   - Deberías ver la aplicación funcionando

2. **Backend API**: Accede desde tu navegador:
   - Si usas localhost: `http://localhost:4000/api/health`
   - Si usas dominio local: `http://api.fitness.local/api/health`
   - Deberías recibir una respuesta JSON con estado "ok"

3. **Base de datos**: Verifica en los logs del backend que la conexión sea exitosa
   - En Coolify, ve a Logs → backend
   - Busca mensajes como "✅ Database connected" o similares

### 4. Verificar Funcionalidad

1. Crea una cuenta de usuario
2. Inicia sesión
3. Verifica que puedas acceder a las funcionalidades principales

## Troubleshooting

### Problema: Los contenedores no inician

**Solución**:
1. Revisa los logs en Coolify para ver errores específicos
2. Verifica que todas las variables de entorno críticas estén configuradas
3. Verifica que `POSTGRES_PASSWORD` y `JWT_SECRET` tengan valores válidos
4. Verifica que `VITE_API_URL` tenga el formato correcto:
   - Para localhost: `http://localhost:4000/api` (con `http://` y `/api` al final)
   - Para producción: `https://api.tudominio.com/api` (con `https://` y `/api` al final)

### Problema: Error de conexión a la base de datos

**Solución**:
1. Verifica que el contenedor `postgres` esté corriendo
2. Verifica que `DATABASE_URL` tenga el formato correcto
3. Verifica que `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` coincidan
4. Revisa los logs del backend para ver el error específico

### Problema: El frontend no puede conectar con el backend

**Solución**:
1. Verifica que `VITE_API_URL` esté configurada correctamente:
   - Para localhost: `http://localhost:4000/api`
   - Para producción: `https://api.tudominio.com/api`
2. Asegúrate de que la URL incluya el protocolo (`http://` para local, `https://` para producción) y termine en `/api`
3. Verifica que el backend esté accesible desde el navegador:
   - Abre `http://localhost:4000/api/health` en tu navegador
   - Deberías ver una respuesta JSON
4. Revisa la consola del navegador (F12) para ver errores CORS o de conexión
5. Si usas localhost, asegúrate de que ambos servicios estén corriendo en los puertos correctos

### Problema: Error 502 Bad Gateway

**Solución**:
1. Verifica que todos los contenedores estén corriendo
2. Verifica que los health checks estén pasando
3. Revisa los logs del contenedor que está fallando
4. Verifica que los puertos estén configurados correctamente

### Problema: SSL no funciona (Solo para producción con dominio real)

**Nota:** En entorno local con localhost, SSL no es necesario. Usa HTTP.

**Si estás usando un dominio real:**
1. Verifica que los registros DNS estén configurados correctamente
2. Espera unos minutos para que los certificados se generen
3. Verifica que el dominio esté añadido en la configuración de Coolify
4. Revisa los logs de Coolify para ver errores de certificado

**Si estás usando ngrok:**
- ngrok proporciona HTTPS automáticamente, no necesitas configuración adicional

### Problema: Las migraciones de base de datos fallan

**Solución**:
1. Verifica que el backend tenga permisos para conectarse a PostgreSQL
2. Verifica que `DATABASE_URL` sea correcta
3. Revisa los logs del backend durante el inicio
4. Puedes ejecutar migraciones manualmente conectándote al contenedor del backend

### Problema: El build del frontend falla

**Solución**:
1. Verifica que `VITE_API_URL` esté configurada como variable de entorno
2. Revisa los logs del build para ver errores específicos
3. Verifica que todas las dependencias estén en `package.json`
4. Asegúrate de que el Dockerfile del frontend esté correcto

### Problemas Específicos de Windows/WSL

#### Problema: No puedo acceder a Coolify desde Windows

**Si Coolify está en WSL:**
1. Verifica que Coolify esté corriendo en WSL: `docker ps` desde WSL
2. Verifica que el puerto 8000 esté expuesto: `netstat -tuln | grep 8000` desde WSL
3. Intenta acceder desde Windows usando `http://localhost:8000` o `http://127.0.0.1:8000`
4. Si no funciona, verifica la configuración de red de WSL: `wsl --status`

**Solución alternativa:**
- Usa la IP de WSL: `wsl hostname -I` y accede desde Windows usando esa IP
- O configura port forwarding en Windows si es necesario

#### Problema: Docker no funciona en WSL

**Solución**:
1. Asegúrate de tener Docker Desktop instalado en Windows
2. Habilita la integración WSL 2 en Docker Desktop:
   - Settings → Resources → WSL Integration
   - Activa tu distribución WSL
3. Reinicia Docker Desktop
4. Verifica desde WSL: `docker ps` debería funcionar

#### Problema: Problemas de permisos con archivos desde WSL

**Solución**:
1. Si trabajas con archivos del proyecto desde WSL, asegúrate de que los permisos sean correctos
2. Evita editar archivos directamente en `/mnt/c/` desde WSL si es posible
3. Trabaja en el sistema de archivos de WSL (`~/` o `/home/usuario/`)
4. Si necesitas acceder a archivos de Windows, usa `cd ~` y clona el repo ahí

#### Problema: Git desde WSL no puede conectarse a GitHub/GitLab

**Solución**:
1. Configura Git en WSL: `git config --global user.name "Tu Nombre"`
2. Configura tu email: `git config --global user.email "tu@email.com"`
3. Para SSH: Genera una clave SSH en WSL y añádela a tu cuenta Git
4. Para HTTPS: Puedes usar un token de acceso personal

### Ver Logs en Coolify

Para diagnosticar problemas:

1. Ve a tu aplicación en Coolify
2. Haz clic en **"Logs"** o **"Registros"**
3. Selecciona el contenedor específico que quieres revisar
4. Los logs se actualizan en tiempo real

### Comandos Útiles para Debugging

**Desde WSL:**

```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Ver logs de un contenedor específico
docker logs fitness-backend-prod
docker logs fitness-frontend-prod
docker logs fitness-db-prod

# Ver logs en tiempo real (seguir)
docker logs -f fitness-backend-prod

# Entrar a un contenedor (shell interactivo)
docker exec -it fitness-backend-prod sh

# Verificar conexión a la base de datos desde el backend
docker exec -it fitness-backend-prod node -e "require('./db/db_config').checkDatabaseHealth().then(() => console.log('OK')).catch(e => console.error(e))"

# Verificar que los puertos estén expuestos
netstat -tuln | grep -E '4000|5173|5432|8000'

# Ver el estado de Coolify
docker ps | grep coolify
docker logs coolify

# Reiniciar un contenedor específico
docker restart fitness-backend-prod

# Ver uso de recursos
docker stats
```

**Desde PowerShell en Windows:**

```powershell
# Verificar que WSL esté corriendo
wsl --list --running

# Acceder a WSL desde PowerShell
wsl

# Verificar puertos desde Windows
netstat -ano | findstr "4000"
netstat -ano | findstr "5173"
netstat -ano | findstr "8000"
```

## Estructura del Proyecto

Tu proyecto debe tener esta estructura para que Coolify lo despliegue correctamente:

```
.
├── docker-compose.prod.yml    # Archivo de docker-compose para producción
├── fitness-app-backend/       # Código del backend
│   ├── Dockerfile
│   └── ...
├── fitness-app-frontend/      # Código del frontend
│   ├── Dockerfile
│   └── ...
└── ...
```

## Notas Adicionales

### Volúmenes Persistentes

Coolify gestiona automáticamente los volúmenes de Docker. El volumen `postgres_data` se creará automáticamente y persistirá los datos de la base de datos.

### Redes Docker

El archivo `docker-compose.prod.yml` crea una red `fitness-network` que permite la comunicación entre los servicios. Coolify gestiona esto automáticamente.

### Health Checks

Los health checks están configurados para:
- **PostgreSQL**: Verifica que la base de datos esté lista
- **Backend**: Verifica el endpoint `/api/health`
- **Frontend**: Verifica que nginx responda

### Migraciones de Base de Datos

Las migraciones se ejecutan automáticamente al iniciar el backend mediante el script `docker-entrypoint.sh`. Si fallan, el contenedor no iniciará.

### Actualizaciones

Para actualizar la aplicación:
1. Haz push de tus cambios al repositorio
2. Si tienes Auto Deploy activado, se desplegará automáticamente
3. Si no, haz clic en "Deploy" manualmente en Coolify

## Recursos Adicionales

- [Documentación oficial de Coolify](https://coolify.io/docs)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)

## Soporte

Si encuentras problemas que no están cubiertos en esta guía:
1. Revisa los logs en Coolify
2. Consulta la documentación oficial de Coolify
3. Verifica que todas las variables de entorno estén correctamente configuradas
4. Revisa que el `docker-compose.prod.yml` esté correctamente formateado

