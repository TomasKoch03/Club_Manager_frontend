# Funcionalidad de Edición de Reservas - Documentación

## 🎯 Resumen
Se ha implementado la funcionalidad completa de **edición de reservas exclusivamente para administradores** en el frontend, integrada con el endpoint `PUT /reservation/{reservation_id}` del backend.

---

## 📋 Archivos Modificados/Creados

### Nuevos Componentes
- `src/components/bookings/EditReservationModal.jsx` - Modal para editar reservas con validaciones

### Archivos Modificados
- `src/services/api.js` - Agregados endpoints `getReservationById()` y `updateReservation()`
- `src/components/bookings/ReservationCard.jsx` - Agregado botón de edición y indicador de candado para reservas con pago
- `src/pages/all_bookings.jsx` - Integración completa del sistema de edición

---

## 🔐 Permisos y Restricciones

### Solo Administradores
- ✅ Solo usuarios con `is_admin=true` pueden ver el botón "Editar"
- ✅ Validación en frontend antes de mostrar opciones de edición
- ✅ El backend valida que el token Bearer corresponda a un admin

### Reservas con Pago
- 🔒 **NO SE PUEDEN EDITAR** reservas que tengan un pago asociado (`reservation.payment !== null`)
- 🔒 Se muestra un icono de candado (🔒) en la tarjeta de la reserva
- 🔒 El formulario se deshabilita completamente
- 🔒 Se muestra alerta: "⚠️ Esta reserva no se puede modificar porque tiene un pago asociado"
- 🔒 El botón cambia de "Editar" a "Ver" cuando hay pago

---

## 🎨 Flujo de Usuario (Admin)

### 1. Vista de Reservas
El administrador ve todas las reservas en `/admin/reservas` con:
- Tarjetas de reserva con información completa
- Indicador visual de candado 🔒 para reservas con pago
- Botón "Editar" (azul) para reservas sin pago
- Botón "Ver" (gris) para reservas con pago (solo lectura)

### 2. Hacer Clic en "Editar"
Al hacer clic en el botón de edición:
- Se abre un modal con el formulario pre-llenado
- Se cargan las canchas disponibles (todas las canchas)
- Se cargan los usuarios activos (solo usuarios con `is_active=true`)

### 3. Formulario de Edición
El formulario incluye:
- **Select de Usuario** - Lista de usuarios activos con nombre y email
- **Select de Cancha** - Lista de canchas con deporte y precio
- **Fecha y Hora de Inicio** - DateTimePicker con formato local
- **Fecha y Hora de Fin** - DateTimePicker con formato local
- **Información de la reserva** - ID, estado, fecha de creación

### 4. Validaciones Frontend
Antes de enviar:
- ✅ Hora de fin debe ser posterior a hora de inicio
- ✅ Todos los campos son obligatorios
- ✅ No se puede editar si hay pago asociado

### 5. Guardar Cambios
Al hacer clic en "Guardar Cambios":
- Se envía `PUT /reservation/{id}` con los campos modificados
- Se muestra toast de éxito o error según respuesta
- Se recargan las reservas automáticamente
- Se cierra el modal

---

## 🚨 Manejo de Errores

### Códigos HTTP y Mensajes User-Friendly

| Código | Mensaje al Usuario |
|--------|-------------------|
| **200 OK** | ✅ "Reserva actualizada exitosamente" |
| **401 UNAUTHORIZED** | ❌ "No tienes permisos para modificar reservas" |
| **403 FORBIDDEN** | ❌ "No se puede modificar esta reserva porque tiene un pago asociado o el usuario está inactivo" |
| **404 NOT FOUND** | ❌ "La reserva, cancha o usuario no fue encontrado" |
| **409 CONFLICT** | ❌ "El horario seleccionado ya está ocupado para esta cancha" |
| **Otro** | ❌ "Error al actualizar la reserva. Por favor, intenta nuevamente." |

---

## 🔧 Endpoints Utilizados

### Edición de Reservas
```http
PUT /reservation/{reservation_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "court_id": 2,
  "user_id": 7,
  "start_time": "2025-11-20T14:00:00",
  "end_time": "2025-11-20T15:00:00"
}
```

### Obtener Detalles de Reserva
```http
GET /reservation/{reservation_id}
Authorization: Bearer {token}
```

### Listar Canchas
```http
GET /court/
Authorization: Bearer {token}
```

### Listar Usuarios
```http
GET /user/
Authorization: Bearer {token}
```

---

## 📊 Reglas de Negocio Implementadas

### 1. Protección de Reservas con Pago ✅
- Si `reservation.payment !== null` → Formulario bloqueado
- Respuesta backend: 403 FORBIDDEN

### 2. Solo Administradores ✅
- Validación: `currentUser.is_admin === true`
- Botón de editar solo visible para admins
- Respuesta backend: 401 UNAUTHORIZED si no es admin

### 3. Conflictos de Horario ✅
- Backend valida solapamientos
- Mensaje: "El horario seleccionado ya está ocupado para esta cancha"
- Respuesta backend: 409 CONFLICT

### 4. Usuario Activo ✅
- Select solo muestra usuarios con `is_active=true`
- Backend valida estado del usuario
- Respuesta backend: 403 FORBIDDEN si usuario inactivo

### 5. Recursos Existentes ✅
- Backend valida que reserva, cancha y usuario existan
- Respuesta backend: 404 NOT FOUND

---

## 🎨 Componentes del Sistema

### EditReservationModal
**Props:**
- `show` (boolean) - Mostrar/ocultar modal
- `onHide` (function) - Callback al cerrar
- `reservation` (object) - Objeto de reserva a editar
- `courts` (array) - Lista de canchas disponibles
- `users` (array) - Lista de usuarios activos
- `onSave` (function) - Callback al guardar (recibe `reservationId`, `payload`)
- `isSaving` (boolean) - Estado de guardado

**Características:**
- Formulario pre-llenado con datos actuales
- Validación local de fechas
- Deshabilita campos si hay pago
- Convierte fechas entre formato local e ISO UTC
- Muestra información adicional de la reserva

### ReservationCard (Modificado)
**Nuevas Props:**
- `onEditClick` (function) - Callback al hacer clic en editar
- `isAdmin` (boolean) - Si el usuario actual es admin

**Nuevas Características:**
- Icono de candado 🔒 para reservas con pago
- Botón "Editar" visible solo para admins
- Botón cambia a "Ver" si hay pago asociado

---

## 🧪 Pruebas Recomendadas

### Como Administrador:
1. ✅ Ver botón "Editar" en reservas sin pago
2. ✅ Ver botón "Ver" en reservas con pago
3. ✅ Editar una reserva sin pago exitosamente
4. ✅ Ver formulario bloqueado en reserva con pago
5. ✅ Intentar guardar con hora fin antes de hora inicio (debe fallar)
6. ✅ Intentar cambiar a horario ocupado (debe mostrar 409)
7. ✅ Cambiar usuario de la reserva
8. ✅ Cambiar cancha de la reserva
9. ✅ Ver toast de éxito al guardar correctamente
10. ✅ Ver toast de error al fallar

### Como Usuario Normal:
1. ✅ NO ver botón "Editar" en ninguna reserva
2. ✅ Solo ver botón "Pagar" si aplica

---

## 🚀 Comandos Docker

### Ver logs en tiempo real:
```bash
cd /home/santino/Escritorio/GDSIfront/Club_Manager_frontend
docker compose logs -f
```

### Reconstruir contenedores:
```bash
docker compose down --remove-orphans
docker compose build --no-cache --pull
docker compose up -d --force-recreate
```

### Verificar estado:
```bash
docker compose ps
```

---

## 📱 Acceso a la Aplicación

- **URL Local:** http://localhost:5173/
- **Network:** http://172.19.0.2:5173/

---

## ✅ Checklist de Implementación

- [x] Endpoint `updateReservation()` en api.js
- [x] Endpoint `getReservationById()` en api.js
- [x] Componente `EditReservationModal.jsx` creado
- [x] Botón de edición en `ReservationCard.jsx`
- [x] Indicador visual de pago (candado 🔒)
- [x] Integración en `all_bookings.jsx`
- [x] Validación de admin en frontend
- [x] Carga de canchas y usuarios
- [x] Validaciones de formulario locales
- [x] Manejo de errores HTTP con mensajes user-friendly
- [x] Toasts para feedback del usuario
- [x] Deshabilitar edición si hay pago
- [x] Conversión de fechas UTC ↔ Local
- [x] Recarga automática de reservas tras edición
- [x] Sin errores de compilación

---

## 🎉 Resultado Final

La funcionalidad está **100% completada** y lista para usar. Los administradores ahora pueden:
- ✅ Ver y editar reservas sin pago
- ✅ Ver detalles de reservas con pago (solo lectura)
- ✅ Cambiar usuario, cancha, fecha y hora
- ✅ Recibir feedback claro con mensajes de error específicos
- ✅ Ver indicadores visuales de qué reservas son editables

**¡Todo funciona según las especificaciones del backend!** 🚀
