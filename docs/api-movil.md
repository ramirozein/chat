# API Móvil — Documentación Completa

Documentación de la API REST para el desarrollo de la aplicación móvil del chat. Incluye autenticación, chat en tiempo real, chatbot con IA, y gestión de fotos de perfil.

---

## Configuración Base

| Parámetro | Valor |
|---|---|
| **Base URL** | `https://<DOMINIO>/api/movil` |
| **Protocolo** | HTTPS |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Autenticación** | Bearer Token (JWT) |
| **Socket.IO** | `wss://<DOMINIO>` (mismo servidor) |

### Headers Comunes

```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

> **Nota**: Los endpoints de login y registro NO requieren el header `Authorization`.

---

## Esquemas de Datos

### Usuario

```json
{
  "id": "clxyz123abc",
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "fotoPerfil": "https://storage.googleapis.com/bucket/fotos-perfil/juanperezFotoPerfil.png?v=1710000000",
  "creadoEn": "2026-01-15T10:30:00.000Z"
}
```

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `string` | No | ID único (CUID) |
| `nombre` | `string` | No | Nombre visible |
| `email` | `string` | No | Email único |
| `fotoPerfil` | `string` | Sí | URL de la foto en GCS |
| `creadoEn` | `string` (ISO 8601) | No | Fecha de registro |

### Conversación

```json
{
  "id": "clxyz456def",
  "creadoEn": "2026-03-10T15:00:00.000Z",
  "actualizadoEn": "2026-03-11T08:30:00.000Z",
  "participantes": [
    { "id": "clx1", "nombre": "Juan", "email": "juan@ejemplo.com", "fotoPerfil": null },
    { "id": "clx2", "nombre": "María", "email": "maria@ejemplo.com", "fotoPerfil": "https://..." }
  ],
  "ultimoMensaje": {
    "contenido": "Hola, ¿cómo estás?",
    "creadoEn": "2026-03-11T08:30:00.000Z",
    "autorId": "clx1"
  }
}
```

### Mensaje

```json
{
  "id": "clxyz789ghi",
  "contenido": "Hola, ¿cómo estás?",
  "autorId": "clx1",
  "autor": {
    "id": "clx1",
    "nombre": "Juan",
    "fotoPerfil": null
  },
  "conversacionId": "clxyz456def",
  "creadoEn": "2026-03-11T08:30:00.000Z"
}
```

> **Importante**: Los mensajes se almacenan **cifrados** (AES-256-GCM) en la base de datos. La API los retorna ya **descifrados**.

### Respuestas de Error

Todas las respuestas de error siguen este formato:

```json
{
  "error": "Descripción del error"
}
```

| Código HTTP | Significado |
|---|---|
| `400` | Parámetros faltantes o inválidos |
| `401` | No autenticado o token inválido/expirado |
| `403` | Sin permiso para acceder al recurso |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej: email ya registrado) |
| `500` | Error interno del servidor |

---

## 1. Autenticación

### `POST /api/movil/auth/registro`

Registra un nuevo usuario y retorna un JWT.

**Headers**: Ninguno requerido

**Body**:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "contrasena": "miContraseña123"
}
```

**Respuesta exitosa** (201):
```json
{
  "usuario": {
    "id": "clxyz123abc",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errores posibles**: `400` campos faltantes, `409` email duplicado

---

### `POST /api/movil/auth/login`

Inicia sesión y retorna un JWT.

**Headers**: Ninguno requerido

**Body**:
```json
{
  "email": "juan@ejemplo.com",
  "contrasena": "miContraseña123"
}
```

**Respuesta exitosa** (200):
```json
{
  "usuario": {
    "id": "clxyz123abc",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "fotoPerfil": "https://..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errores posibles**: `400` campos faltantes, `401` credenciales inválidas

> **Nota para la app**: Guardar el `token` en almacenamiento seguro del dispositivo (Keychain en iOS, EncryptedSharedPreferences en Android). Usarlo en todos los requests subsecuentes como `Authorization: Bearer <token>`. El token expira en **7 días**.

---

### `GET /api/movil/auth/yo`

Obtiene el perfil del usuario autenticado.

**Headers**: `Authorization: Bearer <token>`

**Respuesta exitosa** (200):
```json
{
  "usuario": {
    "id": "clxyz123abc",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "fotoPerfil": "https://...",
    "creadoEn": "2026-01-15T10:30:00.000Z"
  }
}
```

---

### `PUT /api/movil/auth/perfil`

Actualiza el nombre del usuario.

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "nombre": "Juan Carlos Pérez"
}
```

**Respuesta exitosa** (200):
```json
{
  "usuario": {
    "id": "clxyz123abc",
    "nombre": "Juan Carlos Pérez",
    "email": "juan@ejemplo.com",
    "fotoPerfil": "https://..."
  }
}
```

---

### `POST /api/movil/auth/foto-perfil`

Sube o reemplaza la foto de perfil del usuario.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body** (`multipart/form-data`):

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `foto` | `File` (imagen) | Sí | Archivo de imagen (jpeg, png, etc.) |

**Restricciones**:
- Tamaño máximo: **10 MB**
- Solo archivos de imagen (`image/*`)
- Se comprime automáticamente a **512×512 px** máximo en formato PNG

**Respuesta exitosa** (200):
```json
{
  "fotoPerfil": "https://storage.googleapis.com/bucket/fotos-perfil/juanperezFotoPerfil.png?v=1710000000"
}
```

> **Nota para la app**: Después de subir la foto, actualizar la imagen de perfil con la nueva URL retornada. El query param `?v=` cambia en cada actualización para evitar cache.

---

## 2. Conversaciones

### `GET /api/movil/conversaciones`

Lista todas las conversaciones del usuario, ordenadas por más reciente.

**Headers**: `Authorization: Bearer <token>`

**Respuesta exitosa** (200):
```json
{
  "conversaciones": [
    {
      "id": "clxyz456def",
      "creadoEn": "2026-03-10T15:00:00.000Z",
      "actualizadoEn": "2026-03-11T08:30:00.000Z",
      "participantes": [
        { "id": "clx1", "nombre": "Juan", "email": "juan@ejemplo.com", "fotoPerfil": null },
        { "id": "clx2", "nombre": "María", "email": "maria@ejemplo.com", "fotoPerfil": "https://..." }
      ],
      "ultimoMensaje": {
        "contenido": "Hola, ¿cómo estás?",
        "creadoEn": "2026-03-11T08:30:00.000Z",
        "autorId": "clx1"
      }
    }
  ]
}
```

> **Nota para la app**: `ultimoMensaje` es `null` si la conversación no tiene mensajes. Para mostrar el nombre de la conversación, usar el nombre del participante que **no** sea el usuario autenticado. Si el participante tiene email `bot@chatbot.ia`, es una conversación con el chatbot.

---

### `POST /api/movil/conversaciones`

Crea una nueva conversación o retorna la existente si ya hay una entre ambos usuarios.

**Headers**: `Authorization: Bearer <token>`

**Body** (conversación con usuario):
```json
{
  "emailDestino": "maria@ejemplo.com"
}
```

**Body** (conversación con chatbot):
```json
{
  "esChatbot": true
}
```

**Respuesta exitosa — nueva conversación** (201):
```json
{
  "conversacion": {
    "id": "clxyz456def",
    "creadoEn": "2026-03-11T09:00:00.000Z",
    "actualizadoEn": "2026-03-11T09:00:00.000Z",
    "participantes": [
      { "id": "clx1", "nombre": "Juan", "email": "juan@ejemplo.com", "fotoPerfil": null },
      { "id": "clx2", "nombre": "María", "email": "maria@ejemplo.com", "fotoPerfil": null }
    ]
  },
  "existente": false
}
```

**Respuesta — conversación ya existente** (200):
```json
{
  "conversacion": { ... },
  "existente": true
}
```

> El campo `existente` indica si se creó una nueva conversación o se retornó una preexistente. Si es `true`, la app puede simplemente navegar a esa conversación.

---

## 3. Mensajes y Chatbot

### `GET /api/movil/mensajes`

Obtiene los mensajes descifrados de una conversación con paginación basada en cursor.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

| Parámetro | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `conversacionId` | `string` | Sí | — | ID de la conversación |
| `cursor` | `string` | No | — | ID del último mensaje recibido (para cargar más) |
| `limite` | `number` | No | `50` | Cantidad de mensajes (máx. 100) |

**Ejemplo**: `GET /api/movil/mensajes?conversacionId=clxyz456def&limite=20`

**Respuesta exitosa** (200):
```json
{
  "mensajes": [
    {
      "id": "clxyz789ghi",
      "contenido": "Hola!",
      "autorId": "clx1",
      "autor": { "id": "clx1", "nombre": "Juan", "fotoPerfil": null },
      "conversacionId": "clxyz456def",
      "creadoEn": "2026-03-11T08:00:00.000Z"
    },
    {
      "id": "clxyz790jkl",
      "contenido": "¿Cómo estás?",
      "autorId": "clx2",
      "autor": { "id": "clx2", "nombre": "María", "fotoPerfil": "https://..." },
      "conversacionId": "clxyz456def",
      "creadoEn": "2026-03-11T08:01:00.000Z"
    }
  ],
  "siguienteCursor": "clxyz790jkl",
  "hayMas": true
}
```

**Paginación**:
1. Primera carga: `GET /api/movil/mensajes?conversacionId=X`
2. Cargar más: `GET /api/movil/mensajes?conversacionId=X&cursor=<siguienteCursor>`
3. Cuando `hayMas` es `false`, no hay más mensajes por cargar

---

### `POST /api/movil/mensajes`

Envía un mensaje en una conversación. Si la conversación incluye al chatbot, la respuesta del bot se genera automáticamente y se incluye en la respuesta.

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "conversacionId": "clxyz456def",
  "contenido": "Hola, ¿qué puedes hacer?"
}
```

**Respuesta — conversación normal** (201):
```json
{
  "mensaje": {
    "id": "clxyz800mno",
    "contenido": "Hola, ¿qué puedes hacer?",
    "autorId": "clx1",
    "autor": { "id": "clx1", "nombre": "Juan", "fotoPerfil": null },
    "conversacionId": "clxyz456def",
    "creadoEn": "2026-03-11T09:00:00.000Z"
  },
  "respuestaBot": null
}
```

**Respuesta — conversación con chatbot** (201):
```json
{
  "mensaje": {
    "id": "clxyz800mno",
    "contenido": "Hola, ¿qué puedes hacer?",
    "autorId": "clx1",
    "autor": { "id": "clx1", "nombre": "Juan", "fotoPerfil": null },
    "conversacionId": "clxyz456def",
    "creadoEn": "2026-03-11T09:00:00.000Z"
  },
  "respuestaBot": {
    "id": "clxyz801pqr",
    "contenido": "¡Hola Juan! 👋 Puedo ayudarte con muchas cosas...",
    "autorId": "clxbot1",
    "autor": { "id": "clxbot1", "nombre": "Chatbot IA", "fotoPerfil": null },
    "conversacionId": "clxyz456def",
    "creadoEn": "2026-03-11T09:00:02.000Z"
  }
}
```

**Si el chatbot falla** (201 — el mensaje del usuario SÍ se envía):
```json
{
  "mensaje": { ... },
  "respuestaBot": null,
  "errorBot": "No se pudo obtener respuesta del chatbot"
}
```

> **Nota para la app**: Verificar siempre si `respuestaBot` no es `null` para agregar el mensaje del bot al historial local. El chatbot usa el modelo GPT-4o-mini y tiene contexto de los últimos 20 mensajes de la conversación.

---

## 4. Búsqueda de Usuarios

### `GET /api/movil/usuarios/buscar`

Busca usuarios por nombre o email para iniciar nuevas conversaciones.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `q` | `string` | Sí | Texto de búsqueda (mín. 2 caracteres) |

**Ejemplo**: `GET /api/movil/usuarios/buscar?q=maria`

**Respuesta exitosa** (200):
```json
{
  "usuarios": [
    {
      "id": "clx2",
      "nombre": "María García",
      "email": "maria@ejemplo.com",
      "fotoPerfil": "https://..."
    }
  ]
}
```

> La búsqueda es **case-insensitive**, retorna máx. 20 resultados, y excluye automáticamente al usuario autenticado y al bot.

---

## 5. Chat en Tiempo Real (Socket.IO)

Para chat en tiempo real, la app móvil se conecta al servidor Socket.IO. Esto permite recibir mensajes instantáneamente sin hacer polling.

### Conexión

```javascript
import { io } from 'socket.io-client';

const socket = io('https://<DOMINIO>', {
  auth: {
    token: '<token_jwt>'  // El mismo JWT del login
  }
});
```

### Eventos del Cliente → Servidor

| Evento | Payload | Descripción |
|---|---|---|
| `unirse-conversacion` | `conversacionId: string` | Unirse a una sala para recibir mensajes |
| `salir-conversacion` | `conversacionId: string` | Salir de la sala |
| `enviar-mensaje` | `{ conversacionId: string, contenido: string }` | Enviar un mensaje |

### Eventos del Servidor → Cliente

| Evento | Payload | Descripción |
|---|---|---|
| `nuevo-mensaje` | `Mensaje` (ver esquema arriba) | Mensaje nuevo en la conversación |
| `chatbot-escribiendo` | `boolean` | Indicador de que el chatbot está generando respuesta |
| `chatbot-token` | `{ conversacionId, token, acumulado }` | Token individual del streaming del chatbot |
| `chatbot-mensaje-final` | `Mensaje` | Mensaje completo del chatbot (guardar este en historial) |
| `chatbot-error` | `{ conversacionId, error }` | Error al generar respuesta del chatbot |
| `error-mensaje` | `{ error: string }` | Error al enviar mensaje |

### Flujo Recomendado para la App Móvil

```
1. Login → obtener token JWT
2. Conectar Socket.IO con el token
3. GET /conversaciones → listar chats
4. Al abrir un chat:
   a. socket.emit('unirse-conversacion', conversacionId)
   b. GET /mensajes?conversacionId=X → cargar historial
   c. Escuchar evento 'nuevo-mensaje' para mensajes entrantes
5. Para enviar mensaje:
   - Opción A (WebSocket activo): socket.emit('enviar-mensaje', { conversacionId, contenido })
   - Opción B (REST fallback): POST /mensajes { conversacionId, contenido }
6. Al salir del chat: socket.emit('salir-conversacion', conversacionId)
```

### Streaming del Chatbot (Socket.IO)

Cuando se envía un mensaje en una conversación con el chatbot por WebSocket:

```
1. Se emite 'chatbot-escribiendo' → true (mostrar indicador de escritura)
2. Se emiten múltiples 'chatbot-token' con tokens individuales:
   - token: "Hola"
   - token: " Juan"
   - token: "! 👋"
   - acumulado contiene el texto completo hasta ese momento
3. Se emite 'chatbot-mensaje-final' con el mensaje completo
4. Se emite 'chatbot-escribiendo' → false (ocultar indicador)
```

> **Nota**: Para la versión REST (POST /mensajes), el chatbot NO hace streaming — devuelve la respuesta completa en una sola llamada HTTP. Solo el WebSocket soporta streaming token por token.

---

## 6. Flujo Completo de la App

```
┌─────────────┐
│   Splash     │
│   Screen     │
└──────┬───────┘
       │ ¿Token guardado?
       ▼
┌──────────────┐  No    ┌──────────────┐
│  Verificar   │───────►│   Login /     │
│  GET /yo     │        │   Registro    │
└──────┬───────┘        └──────┬───────┘
       │ Sí (válido)           │ POST /login o /registro
       ▼                       ▼ Guardar token
┌──────────────────────────────────────┐
│           Lista de Chats             │
│         GET /conversaciones          │
│  ┌────────────────────────────────┐  │
│  │ 🔍 Buscar usuario (GET /buscar)│  │
│  │ 🤖 Nuevo chat con bot         │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │ Seleccionar conversación
               ▼
┌──────────────────────────────────────┐
│          Pantalla de Chat            │
│    GET /mensajes (historial)         │
│    Socket.IO (tiempo real)           │
│    POST /mensajes (enviar)           │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Si es chatbot:                 │  │
│  │ - Mostrar "escribiendo..."    │  │
│  │ - Streaming de respuesta      │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 7. Notas de Implementación

### Seguridad
- Los tokens JWT expiran en **7 días**
- Todas las contraseñas se hashean con **bcrypt** (10 rondas)
- Los mensajes se cifran con **AES-256-GCM** antes de almacenarse
- Las fotos se comprimen server-side con **sharp** (máx 512×512)

### Almacenamiento del Token (App Móvil)
- **iOS**: Keychain Services
- **Android**: EncryptedSharedPreferences
- **React Native**: react-native-keychain
- **Flutter**: flutter_secure_storage

### Manejo de Token Expirado
Cuando cualquier endpoint retorna `401`:
1. Borrar el token almacenado
2. Redirigir al usuario a la pantalla de login
3. Tras login exitoso, reconectar el Socket.IO con el nuevo token

### Consideraciones de Red
- Implementar **retry** con backoff exponencial para fallos de red
- Usar **cache local** de conversaciones y mensajes para experiencia offline
- Reconectar Socket.IO automáticamente al recuperar conexión
