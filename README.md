# Gestor de Solicitudes Offline-First

Proyecto educativo con arquitectura de 3 capas para gestionar solicitudes, mantenerlas localmente cuando el backend no está disponible y sincronizarlas posteriormente con un API en .NET.

---

## Tabla de contenido

- [Descripción general](#descripción-general)
- [Arquitectura](#arquitectura)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Prerrequisitos](#prerrequisitos)
- [Configuración](#configuración)
- [Ejecución local](#ejecución-local)
- [Verificación rápida](#verificación-rápida)
- [Flujo funcional](#flujo-funcional)
- [Archivos de datos persistentes](#archivos-de-datos-persistentes)
- [Endpoints principales](#endpoints-principales)
- [Comportamiento offline-first](#comportamiento-offline-first)
- [Notas importantes](#notas-importantes)

---

## Descripción general

El **Gestor de Solicitudes** es una aplicación **offline-first** compuesta por tres proyectos principales:

1. **Frontend React**: interfaz de usuario.
2. **Servicio local Node.js**: persistencia local, gestión de grupos y sincronización.
3. **Backend .NET**: catálogo y ejecución de operaciones de negocio.

El objetivo principal es permitir que el usuario pueda crear y administrar solicitudes aunque el backend no esté disponible.

Las solicitudes se almacenan localmente en archivos JSON y luego se sincronizan con el backend cuando esté activo.

---

## Arquitectura

```text
Frontend React
http://localhost:5173
        |
        v
Servicio local Node.js
http://localhost:3001
        |
        |---- Archivos locales:
        |     - solicitudes.json
        |     - grupos.json
        |     - operations-cache.json
        |
        v
Backend ASP.NET Core
http://localhost:5153
        |
        |---- Archivos backend:
              - received-requests.json
              - solicitudes.json
```

### Responsabilidad de cada capa

| Capa | Responsabilidad |
|---|---|
| Frontend React | Mostrar la interfaz, crear solicitudes, listar información y ejecutar sincronización |
| Servicio local Node.js | Guardar datos offline, manejar grupos, consultar operaciones y sincronizar con backend |
| Backend .NET | Exponer operaciones de negocio, procesar solicitudes y registrar ejecuciones recibidas |

---

## Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Frontend | React 18, Vite |
| Servicio local | Node.js, Express 5, Axios, UUID |
| Backend | ASP.NET Core `net10.0` |
| Persistencia | Archivos JSON en disco |

---

## Estructura del repositorio

```text
.
├── backend-dotnet/       # API .NET para operaciones de negocio
├── local-service-node/   # API local, persistencia offline y sincronización
├── frontend-react/       # Interfaz web
└── domain/               # Modelo compartido de solicitud
```

---

## Prerrequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- .NET SDK 10.x, ya que el proyecto apunta a `net10.0`.
- Node.js 18 o superior.
- npm.
- Git, opcional para clonar y versionar el proyecto.

---

## Configuración

### 1. Servicio local Node.js

Archivo de configuración:

```text
local-service-node/src/config/backend.config.js
```

Variables disponibles:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `BACKEND_URL` | URL del backend .NET usado por Node.js para operaciones y sincronización | `http://localhost:5153` |
| `PORT` | Puerto del servicio local Node.js | `3001` |

Ejemplo en Linux/macOS:

```bash
export BACKEND_URL=http://localhost:5153
export PORT=3001
```

Ejemplo en Windows PowerShell:

```powershell
$env:BACKEND_URL="http://localhost:5153"
$env:PORT="3001"
```

---

### 2. Backend .NET

Archivo:

```text
backend-dotnet/Properties/launchSettings.json
```

Configuración esperada:

```text
ASPNETCORE_ENVIRONMENT=Development
applicationUrl=http://localhost:5153
```

También puedes sobrescribir la URL por variable de entorno.

Linux/macOS:

```bash
export ASPNETCORE_URLS=http://localhost:5153
```

Windows PowerShell:

```powershell
$env:ASPNETCORE_URLS="http://localhost:5153"
```

---

### 3. Frontend React

Actualmente el frontend no usa archivo `.env` para configurar la URL del API local.

La URL del servicio local está definida directamente en:

```text
frontend-react/src/api/requestApi.js
frontend-react/src/api/groupApi.js
```

Valor actual:

```js
const API_URL = 'http://localhost:3001/api';
```

---

## Ejecución local

Para ejecutar todo el sistema localmente, abre **3 terminales**.

### Terminal 1: Backend .NET

```bash
cd backend-dotnet
dotnet restore
dotnet build
dotnet run
```

Resultado esperado:

```text
Now listening on: http://localhost:5153
```

### Terminal 2: Servicio local Node.js

```bash
cd local-service-node
npm install
npm start
```

Resultado esperado:

```text
Local service running on http://localhost:3001
```

### Terminal 3: Frontend React

```bash
cd frontend-react
npm install
npm run dev
```

Resultado esperado:

```text
Vite disponible en http://localhost:5173
```

---

## Verificación rápida

Puedes validar que los servicios estén activos con los siguientes comandos:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/operations
curl http://localhost:5153/api/operations
```

---

## Flujo funcional

El flujo principal del sistema es el siguiente:

```text
1. El frontend consulta las operaciones disponibles mediante Node.js:
   GET http://localhost:3001/api/operations

2. Node.js intenta obtener las operaciones desde el backend .NET:
   GET http://localhost:5153/api/operations

3. Si el backend responde correctamente:
   - Node.js actualiza el archivo operations-cache.json.
   - Node.js devuelve las operaciones al frontend.

4. Si el backend no responde:
   - Node.js usa la información guardada en operations-cache.json.
   - El frontend puede seguir mostrando las operaciones conocidas.

5. El usuario crea una solicitud desde el frontend.

6. Node.js guarda la solicitud localmente en solicitudes.json con estado Pending.

7. El usuario ejecuta la sincronización.

8. Node.js toma las solicitudes Pending o Failed y las envía al backend:
   POST http://localhost:5153/api/operations/execute

9. El backend procesa la operación de negocio.

10. Node.js actualiza el estado local:
    - Processed si la operación fue exitosa.
    - Failed si ocurrió un error.
```

---

## Estados de una solicitud

| Estado | Significado |
|---|---|
| `Pending` | La solicitud fue creada localmente y está pendiente de sincronización |
| `Processed` | La solicitud fue procesada correctamente por el backend |
| `Failed` | La solicitud falló durante la sincronización y puede reintentarse |

---

## Archivos de datos persistentes

### Servicio local Node.js

| Archivo | Descripción |
|---|---|
| `local-service-node/data/solicitudes.json` | Solicitudes locales y su estado de sincronización |
| `local-service-node/data/grupos.json` | Grupos de interfaz, sistema y personalizados |
| `local-service-node/data/operations-cache.json` | Caché local de operaciones disponibles |

### Backend .NET

| Archivo | Descripción |
|---|---|
| `backend-dotnet/data/received-requests.json` | Ejecuciones recibidas por `/api/operations/execute` |
| `backend-dotnet/data/solicitudes.json` | Persistencia del controlador legacy `/api/requests` |

---

## Endpoints principales

### Servicio local Node.js

Base URL:

```text
http://localhost:3001
```

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Verifica el estado del servicio local |
| GET | `/api/operations` | Obtiene operaciones desde backend o caché local |
| GET | `/api/requests` | Lista solicitudes locales |
| GET | `/api/requests/:id` | Obtiene una solicitud local por id |
| POST | `/api/requests` | Crea una solicitud local |
| POST | `/api/requests/sync` | Sincroniza solicitudes pendientes o fallidas |
| GET | `/api/groups` | Lista grupos |
| GET | `/api/groups/:id` | Obtiene un grupo por id |
| POST | `/api/groups` | Crea un grupo |
| PUT | `/api/groups/:id` | Actualiza un grupo |
| DELETE | `/api/groups/:id` | Elimina un grupo |

### Backend .NET

Base URL:

```text
http://localhost:5153
```

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/operations` | Lista operaciones de negocio disponibles |
| POST | `/api/operations/execute` | Ejecuta una operación de negocio |
| GET | `/api/operations/received-requests` | Lista solicitudes recibidas por el backend |
| GET | `/api/requests` | Endpoint legacy pendiente de validación |
| GET | `/api/requests/{id}` | Endpoint legacy pendiente de validación |
| POST | `/api/requests/receive` | Endpoint legacy pendiente de validación |
| DELETE | `/api/requests/clear` | Endpoint legacy pendiente de validación |

---

## Ejemplo de operación

Ejemplo de solicitud para calcular IVA:

```json
{
  "name": "Calcular IVA de compra",
  "operationCode": "CALCULATE_IVA",
  "payload": {
    "amount": 100000,
    "ivaRate": 0.19
  }
}
```

Resultado esperado después de sincronizar:

```json
{
  "baseAmount": 100000,
  "ivaRate": 0.19,
  "ivaAmount": 19000,
  "totalAmount": 119000
}
```

---

## Comportamiento offline-first

Si el backend .NET está apagado:

```text
- El usuario puede seguir creando solicitudes.
- Las solicitudes quedan guardadas localmente en Node.js.
- Las solicitudes quedan con estado Pending.
- Si se intenta sincronizar, pueden quedar en estado Failed.
- Cuando el backend vuelva a estar disponible, se pueden sincronizar nuevamente.
```

Si no hay backend ni caché de operaciones:

```text
GET /api/operations en Node.js fallará porque no tendrá operaciones disponibles para mostrar.
```

---

## Notas importantes

- El frontend React solo debe consumir el servicio local Node.js.
- El frontend no debe consumir directamente el backend .NET.
- La lógica de negocio vive en el backend .NET.
- Node.js no debe calcular ni ejecutar reglas de negocio.
- Node.js funciona como almacenamiento local y sincronizador.
- La persistencia se realiza en archivos JSON para mantener el proyecto simple y educativo.
- Los endpoints legacy `/api/requests` en backend están marcados como pendientes de validación.

---

## Resumen

```text
React crea solicitudes.
Node.js las guarda localmente.
.NET procesa la lógica de negocio.
Node.js sincroniza y actualiza el estado local.
```
