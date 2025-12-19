# 📦 Resumen Ejecutivo - Despliegue Gratuito

## ✅ ¿Qué necesitas?

1. **Cuenta de GitHub** - Para almacenar tu código
2. **Cuenta en Render.com** - Para backend y base de datos (gratis)
3. **Cuenta en Vercel.com** - Para frontend (gratis)

## ⚡ Pasos Rápidos (15-20 minutos)

### 1️⃣ Base de Datos (Render) - 3 min
- Crear PostgreSQL en Render → Copiar Internal Database URL

### 2️⃣ Backend (Render) - 5 min  
- Crear Web Service en Render
- Configurar variables de entorno
- Esperar despliegue

### 3️⃣ Migraciones - 2 min
- Ejecutar migraciones desde Render Shell o localmente

### 4️⃣ Frontend (Vercel) - 5 min
- Importar proyecto en Vercel
- Configurar `VITE_API_URL`
- Desplegar

## 📋 Variables de Entorno Necesarias

### Backend (Render)
```env
DATABASE_URL=postgresql://... (Internal URL de Render)
JWT_SECRET=clave-aleatoria-segura
PORT=10000
NODE_ENV=production
```

### Frontend (Vercel)
```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

## 🔗 URLs que Obtendrás

- **Backend**: `https://fitness-app-backend.onrender.com`
- **Frontend**: `https://tu-app.vercel.app`
- **Base de Datos**: Accesible solo desde el backend

## 💡 Consejos

1. **Usa Internal Database URL** en Render para mejor rendimiento
2. **Genera JWT_SECRET seguro**: `openssl rand -hex 32`
3. **Ejecuta migraciones** después del primer despliegue
4. **Verifica logs** si algo no funciona

## 📚 Documentación Completa

Ver `DEPLOYMENT_GUIDE.md` para instrucciones detalladas paso a paso.

