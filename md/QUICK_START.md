# ⚡ Inicio Rápido - Coach Mode

## 🚀 Iniciar en 3 Pasos

### Paso 1: Verificar Base de Datos
```bash
cd fitness-app-backend
npm run db:migrate
```

### Paso 2: Iniciar Backend
```bash
npm start
```
✅ Servidor en `http://localhost:4000`

### Paso 3: Iniciar Frontend (nueva terminal)
```bash
cd fitness-app-frontend
npm run dev
```
✅ Frontend en `http://localhost:5173`

## 🧪 Prueba Rápida

1. **Registrar Coach:**
   - Ir a `http://localhost:5173/register`
   - Email: `coach@test.com`
   - Seleccionar "Entrenador"

2. **Invitar Cliente:**
   - En dashboard, clic "Invitar Cliente"
   - Email: `cliente@test.com`
   - Copiar el token de la respuesta

3. **Registrar Cliente:**
   - Ir a `http://localhost:5173/invite/[TOKEN]`
   - Completar registro

4. **Verificar:**
   - Volver al dashboard del coach
   - Verificar que aparece el cliente
   - Clic en cliente para ver detalle

## ✅ ¡Listo!

El sistema está funcionando. Consulta `TESTING_GUIDE.md` para más pruebas.

