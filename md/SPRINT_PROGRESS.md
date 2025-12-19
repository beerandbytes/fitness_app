# Progreso de Sprints - Coach Mode

## ✅ SPRINT 0 - Preparación Técnica (COMPLETADO)

- [x] Rama `feature/coach-mode-full` creada
- [x] Dependencias frontend añadidas:
  - @dnd-kit/core
  - @dnd-kit/sortable
  - @dnd-kit/utilities
  - react-big-calendar
  - lucide-react
- [x] Tipografía Satoshi añadida (via Fontshare CDN)
- [x] Paleta Tailwind actualizada:
  - Primary: #FF5A1F
  - Secondary: #6366F1
  - Background: #F8F9FA
- [x] Migración Drizzle creada:
  - Columna `role` en tabla `users` (CLIENT | COACH | ADMIN, default CLIENT)
  - Columna `coach_id` en tabla `users` (nullable, referencia a users.user_id)
  - Tabla `invite_tokens` creada

## ✅ SPRINT 1 - Modo Entrenador + Sistema de Invitaciones (COMPLETADO)

### Backend
- [x] Endpoint `POST /api/coach/invite` - Crea token de invitación y envía email
- [x] Endpoint `GET /api/invite/:token` - Valida token de invitación
- [x] Registro modificado para aceptar `invitationToken`
- [x] Endpoint `PATCH /api/profile/role` - Actualizar rol del usuario
- [x] `authMiddleware.js` actualizado para incluir `role` en el token
- [x] Rutas registradas en `index.js`

### Frontend
- [x] Página `/invite/[token]` - Formulario de registro con email pre-rellenado
- [x] Página `/select-role` - Selección de rol después del primer login
- [x] `useUserStore` actualizado con métodos `isCoach()`, `isClient()`, `getUserRole()`
- [x] Flujo de login actualizado para redirigir a selección de rol si es necesario
- [x] Componente `InviteClientModal` creado
- [x] Botón "Invitar Cliente" añadido al navbar para coaches
- [x] Rutas añadidas en `App.jsx`

## 🔄 SPRINT 2 - Dashboard del Entrenador (EN PROGRESO)

### Backend (Pendiente)
- [ ] Query `getCoachClients(coachId)` - Lista de clientes con métricas
- [ ] Query `getClientDetail(clientId)` - Histórico completo del cliente
- [ ] Endpoints para obtener datos del dashboard

### Frontend (Pendiente)
- [ ] Ruta `/coach/dashboard`
- [ ] Componente carrusel de clientes
- [ ] Página detalle cliente `/coach/client/[id]` con pestañas
- [ ] Vista tabla de clientes con filtros
- [ ] Banner de alertas para clientes inactivos

## 📋 SPRINT 3 - Plantillas de Rutinas/Dietas + Drag & Drop (Pendiente)

### Migración
- [ ] Tabla `routine_templates`
- [ ] Tabla `diet_templates`
- [ ] Tabla `client_routine_assignments`

### Backend
- [ ] CRUD completo para `routine_templates`
- [ ] CRUD completo para `diet_templates`
- [ ] Endpoint para asignar rutina a cliente

### Frontend
- [ ] Sección "Mis Plantillas" en menú coach
- [ ] Calendario mensual con drag & drop
- [ ] Asignación recurrente de rutinas

## 📋 SPRINT 4 - Check-in Semanal Automático + Fotos (Pendiente)

### Migración
- [ ] Tabla `check_ins`

### Backend
- [ ] Endpoint `POST /api/checkin`
- [ ] Cron job domingo 9:00 para recordatorio

### Frontend
- [ ] Modal/página check-in semanal
- [ ] Grid de fotos con slider Before/After

## 📋 SPRINT 5 - Polish Final + Funcionalidades Premium (Pendiente)

### Backend
- [ ] Sistema de chat (tabla `messages`)
- [ ] Exportar informe a PDF
- [ ] Cálculo de streak de días
- [ ] White-label (logo y color primario)

### Frontend
- [ ] Chat cliente ↔ entrenador
- [ ] Streak en navbar
- [ ] Mejoras de diseño general

---

## Notas Importantes

1. **Migración pendiente**: Ejecutar `npm run db:migrate` en el backend para aplicar los cambios de la base de datos
2. **Variables de entorno**: Asegurarse de que `FRONTEND_BASE_URL` esté configurado para los emails de invitación
3. **SMTP**: Configurar credenciales SMTP para el envío de emails de invitación
4. **Roles**: Los usuarios existentes tendrán `role = 'CLIENT'` por defecto. Los nuevos usuarios sin invitación también serán CLIENT por defecto.

## Próximos Pasos

1. Ejecutar la migración de base de datos
2. Probar el flujo de invitación completo
3. Continuar con Sprint 2 (Dashboard del Entrenador)

