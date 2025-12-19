# ⚡ Resumen Rápido: Obtener DATABASE_URL de Render

## 🎯 Método Más Rápido (2 minutos)

### 1️⃣ Ir a tu Base de Datos en Render
- Render Dashboard → Haz clic en tu PostgreSQL (`fitness-app-db`)

### 2️⃣ Copiar la URL
- Pestaña **"Info"** → Sección **"Internal Database URL"**
- Haz clic en **"Copy"** o selecciónala y copia

### 3️⃣ Configurar en Render Backend
- Dashboard → Tu servicio backend → **"Environment"**
- Haz clic en **"Link Database"**
- Selecciona tu base de datos → Render la configurará automáticamente ✅

---

## 💻 Para Desarrollo Local (.env)

1. **Obtén la External Database URL** (en la misma página de Info)
2. **Ábre tu archivo** `fitness-app-backend/.env`
3. **Agrega:**
   ```env
   DATABASE_URL=postgresql://usuario:password@host:5432/fitnessdb
   ```

---

## 📍 Ubicación en Render Dashboard

```
Dashboard
  └── fitness-app-db (PostgreSQL)
      └── Pestaña "Info"
          ├── Connection Info
          │   ├── Host: ...
          │   ├── Port: 5432
          │   ├── Database: fitnessdb
          │   ├── User: fitnessuser
          │   └── Password: [Show]
          │
          └── Internal Database URL ← ⭐ AQUÍ ESTÁ
              postgresql://user:pass@host/dbname
```

---

## 🔗 Formato de la URL

```
postgresql://usuario:contraseña@host:puerto/nombre_base_datos
```

**Ejemplo real:**
```
postgresql://fitnessuser:abc123@dpg-xxxxx-a.oregon-postgres.render.com/fitnessdb
```

---

## ⚠️ Importante

- ✅ **Internal Database URL**: Para usar en Render (producción)
- ✅ **External Database URL**: Para usar en desarrollo local
- 🔒 La contraseña está **incluida en la URL** - no necesitas copiarla por separado

---

## 📖 Guía Completa

Para más detalles, ver: [COMO_OBTENER_POSTGRESQL_RENDER.md](./COMO_OBTENER_POSTGRESQL_RENDER.md)

