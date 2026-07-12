# Anonymous JWT Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que cualquier visitante entre mediante un botón de acceso anónimo, conservar JWT para autorizar las peticiones y mantener las funcionalidades actuales sin cuentas de GitHub, correo ni contraseña.

**Architecture:** El visitante podrá leer el contenido público sin autenticarse. Al pulsar `LogIn (No credentials)`, el backend creará una identidad anónima técnica y emitirá un JWT; esa identidad podrá crear publicaciones, comentarios y likes usando las rutas existentes. El navegador enviará el JWT en una cookie `HttpOnly` y el backend será el único componente con acceso de escritura a MySQL.

**Tech Stack:** Flask, Flask-SQLAlchemy, PyJWT, MySQL, Next.js 14, React 18, TypeScript, Docker Compose, pytest.

## Global Constraints

- No se solicitará GitHub, correo, contraseña ni registro para utilizar la aplicación.
- JWT seguirá siendo obligatorio para las operaciones de escritura.
- La identidad anónima no representa una cuenta recuperable: si el usuario borra sus cookies, no podrá recuperar sus publicaciones desde esa sesión.
- El frontend nunca recibirá credenciales de MySQL ni secretos JWT.
- El frontend no guardará JWT en `localStorage`; se utilizará una cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`.
- Las lecturas públicas no requerirán sesión; publicaciones, comentarios, likes y cambios de perfil sí.
- El usuario efectivo de cada operación se obtendrá del JWT, nunca de un `user_id` enviado por el navegador.
- No se eliminarán usuarios ni contenido existentes durante la migración.
- No se ejecutarán cambios destructivos de base de datos sin una copia de seguridad verificada.

---

## Estado actual que el implementador debe conservar

- El backend está en `backend/` y su aplicación principal es `backend/app.py`.
- Los modelos actuales están en `backend/SQL/models.py`.
- El frontend usa páginas App Router bajo `front/src/app/`.
- La pantalla inicial está en `front/src/app/page.tsx`.
- El callback GitHub actual está en `front/src/app/github_login/page.tsx`.
- El backend genera actualmente un JWT en `github_callback`, lo guarda en `User.access_token` y el frontend lo guarda en `localStorage`.
- Las rutas actuales de lectura y escritura son `/get_user_data`, `/github_callback`, `/comment`, `/cards`, `/like`, `/profileData`, `/postCards`, `/postData`, `/unlike`, `/trends`, `/users_recomendation` y `/post`.
- El servicio Compose se llama `backend` y construye `./backend`.

## Decisiones de producto

### Acceso de visitante

La pantalla inicial conservará exactamente su estructura y estilos actuales. El único cambio visual permitido será sustituir el contenido y comportamiento del botón GitHub por `LogIn (No credentials)`. No se añadirán textos explicativos, paneles, avisos, botones visibles ni cambios de layout.

El visitante podrá navegar por lecturas públicas antes de pulsar el botón. Si intenta publicar, comentar o dar like sin JWT, el frontend mostrará el mismo CTA y no enviará una mutación sin autorización.

### Identidad técnica

El backend creará una fila `User` marcada como invitado. Esa fila no tendrá correo real. Usará un identificador aleatorio del servidor, por ejemplo `guest_<uuidhex>`, y un correo técnico terminado en `@anonymous.invalid`. El usuario verá un nombre neutro como `Invitado-AB12`; no se expondrá el UUID completo.

Esto mantiene compatibles las relaciones actuales `Post.user_id` y `Like.user_id`, pero debe explicarse en la documentación: no es una cuenta persistente ni recuperable.

### JWT y transporte

El JWT contendrá `sub` con el ID numérico del usuario, `jti`, `is_guest`, `iat` y `exp`. La API validará firma, algoritmo permitido, expiración y existencia del usuario. El JWT se enviará mediante cookie; durante desarrollo, el cliente usará `credentials: include` y Flask permitirá únicamente los orígenes configurados.

### GitHub

GitHub dejará de ser el camino visible de acceso, pero se conservará como referencia histórica. Las claves, variables, dependencias y el flujo anterior no se borrarán: se moverán a bloques comentados, claramente delimitados con encabezados `HISTORICAL GITHUB LOGIN (DISABLED)`, para poder consultar cómo era el proyecto sin afectar la ejecución ni la legibilidad.

---

## Task 1: Preparar configuración y contrato de autenticación

**Files:**

- Create: `backend/auth.py`
- Modify: `backend/app.py`
- Modify: `backend/requirements.txt`
- Modify: `.env.example`
- Modify: `docker-compose.yml`
- Test: `backend/tests/test_auth_contract.py`

**Interfaces:**

- Produces `issue_guest_session()`, `decode_jwt_from_request()` y `require_jwt` para las tareas posteriores.
- `issue_guest_session()` devolverá `(user, encoded_token)`.
- `decode_jwt_from_request()` devolverá un payload validado o una respuesta `401`.
- `require_jwt` colocará el usuario autenticado en `flask.g.current_user`.

- [ ] **Step 1: Crear una prueba del contrato de sesión anónima**

Crear `backend/tests/test_auth_contract.py` con una app de prueba que verifique que una futura petición `POST /auth/guest` devuelve `201`, establece una cookie con atributo `HttpOnly` y no devuelve secretos internos.

```python
def test_guest_session_sets_http_only_cookie(client):
    response = client.post('/auth/guest')
    assert response.status_code == 201
    assert response.json['user']['is_guest'] is True
    assert 'access_token' not in response.json
    assert 'HttpOnly' in response.headers['Set-Cookie']
```

- [ ] **Step 2: Ejecutar la prueba y confirmar el fallo inicial**

Ejecutar desde `backend/`:

```powershell
pytest tests/test_auth_contract.py -q
```

Resultado esperado antes de implementar: fallo porque `/auth/guest` todavía no existe.

- [ ] **Step 3: Añadir configuración explícita de autenticación**

Definir variables no secretas y secretas separadas:

```text
JWT_SECRET_KEY=<valor largo y aleatorio>
JWT_ALGORITHM=HS256
JWT_ACCESS_MINUTES=60
FRONTEND_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
```

En producción `COOKIE_SECURE=true` y `FRONTEND_ORIGIN` será el dominio real. No añadir valores reales al repositorio.

- [ ] **Step 4: Añadir dependencias de prueba y autenticación**

Mantener `PyJWT` y retirar la dependencia separada `jwt`, porque el código utiliza la API de PyJWT. Añadir `pytest` como dependencia de desarrollo. Mantener PyGithub como dependencia histórica comentada y separada del flujo activo.

- [ ] **Step 5: Ejecutar la prueba de contrato**

```powershell
pytest tests/test_auth_contract.py -q
```

Resultado esperado después de las tareas de autenticación: la prueba pasa y la respuesta no contiene el JWT en JSON.

---

## Task 2: Añadir identidad anónima y migración de datos

**Files:**

- Modify: `backend/SQL/models.py`
- Create: `backend/migrations/001_add_guest_fields.sql`
- Create: `backend/seed_guest_policy.py`
- Test: `backend/tests/test_guest_user.py`

**Interfaces:**

- `User.is_guest` será booleano con valor predeterminado `False`.
- `User.guest_public_name` será el nombre público generado para invitados.
- `create_guest_user()` creará usuarios técnicos sin correo real.

- [ ] **Step 1: Escribir pruebas de identidad**

Las pruebas deben verificar que dos sesiones anónimas tienen IDs diferentes, que ninguna usa el mismo `guest_public_name`, que `is_guest` es verdadero y que los usuarios existentes siguen teniendo `is_guest=False`.

```python
def test_guest_users_are_distinct(db_session):
    first = create_guest_user()
    second = create_guest_user()
    assert first.id != second.id
    assert first.is_guest is True
    assert first.guest_public_name != second.guest_public_name
```

- [ ] **Step 2: Crear la migración SQL idempotente**

La migración debe añadir `is_guest` y `guest_public_name`, conservar las columnas actuales y crear un índice único para el nombre público. Debe poder comprobarse antes de ejecutarse y no debe borrar usuarios, posts ni likes.

- [ ] **Step 3: Actualizar el modelo SQLAlchemy**

Añadir las columnas con valores por defecto seguros. Mantener `email` único para usuarios históricos, pero generar para invitados un correo técnico único que no se muestre en la API.

- [ ] **Step 4: Probar la migración sobre una base temporal**

```powershell
docker compose run --rm backend python -m pytest tests/test_guest_user.py -q
```

Resultado esperado: usuarios históricos intactos y dos invitados independientes.

---

## Task 3: Implementar emisión, validación y cierre de JWT

**Files:**

- Create: `backend/auth.py`
- Modify: `backend/app.py`
- Test: `backend/tests/test_guest_auth.py`

**Interfaces:**

- `POST /auth/guest` crea una sesión anónima y establece la cookie JWT.
- `GET /auth/me` devuelve únicamente `id`, `username`, `accountname` e `is_guest`.
- `POST /auth/logout` revoca la sesión actual y limpia la cookie.
- `require_jwt` devuelve `401` para cookie ausente, firma inválida, algoritmo no permitido, JWT expirado o usuario inexistente.

- [ ] **Step 1: Probar los casos de seguridad antes de implementar**

Cubrir cookie ausente, token manipulado, token expirado, algoritmo inesperado, usuario eliminado y logout. Verificar que el JWT nunca aparece en logs ni en la respuesta JSON.

- [ ] **Step 2: Generar el JWT con identidad técnica**

El payload debe usar el ID del usuario como `sub`, un `jti` aleatorio y expiración corta. No usar el correo como identidad principal del token, porque los invitados no tienen correo real.

- [ ] **Step 3: Centralizar la extracción del JWT**

Aceptar cookie `access_token` como mecanismo principal. Durante una transición corta se podrá aceptar `Authorization: Bearer` para no romper clientes existentes, pero todas las nuevas llamadas frontend usarán cookie.

- [ ] **Step 4: Implementar logout y revocación**

Crear una tabla o mecanismo de sesiones revocables identificado por `jti`. Logout revoca únicamente el JWT actual y limpia la cookie. No confiar solo en la expiración para cerrar una sesión.

- [ ] **Step 5: Ejecutar pruebas de autenticación**

```powershell
pytest tests/test_guest_auth.py tests/test_auth_contract.py -q
```

Resultado esperado: todas las variantes inválidas devuelven `401` y el flujo válido devuelve `201`, `200` y `204` según la ruta.

---

## Task 4: Aplicar autorización a todas las operaciones existentes

**Files:**

- Modify: `backend/app.py`
- Modify: `backend/SQL/models.py`
- Create: `backend/tests/test_authorization.py`

**Interfaces:**

- `current_user()` será la única fuente del usuario para mutaciones.
- `require_jwt` protegerá `/post`, `/comment`, `/like` y `/unlike`.
- Las lecturas `/cards`, `/postCards`, `/postData`, `/trends`, `/users_recomendation` y `/profileData` mantendrán acceso público solo donde no se requiera personalización.

- [ ] **Step 1: Escribir pruebas de autorización**

Verificar que una petición sin JWT no puede crear contenido, que un usuario no puede borrar o modificar contenido de otro, que el `user_id` enviado en JSON se ignora y que el usuario se obtiene del JWT.

- [ ] **Step 2: Sustituir validaciones duplicadas**

Eliminar la lectura manual de `Authorization` en cada endpoint y usar `g.current_user`. Mantener mensajes de error consistentes y no devolver trazas internas.

- [ ] **Step 3: Corregir likes y unlikes**

Validar firma y expiración antes de buscar el usuario. Añadir una restricción única `(user_id, post_id)` para impedir likes duplicados y devolver una respuesta idempotente en `unlike`.

- [ ] **Step 4: Añadir límites de publicación y comentario**

Validar JSON, contenido no vacío, longitud máxima, tipo de dato, post existente y límites de frecuencia. No aceptar `user_id`, `email` ni `access_token` desde el cuerpo de la petición.

- [ ] **Step 5: Ejecutar pruebas de autorización**

```powershell
pytest tests/test_authorization.py -q
```

Resultado esperado: todas las operaciones de escritura sin sesión devuelven `401`; las operaciones válidas usan exclusivamente la identidad del JWT.

---

## Task 5: Sustituir el flujo activo de GitHub en Next.js

**Files:**

- Modify: `front/src/app/page.tsx`
- Create: `front/src/lib/api-client.ts`
- Create: `front/src/components/AuthProvider.tsx`
- Modify: `front/src/app/home/page.tsx`
- Modify: `front/src/app/components/Write-Post.tsx`
- Modify: `front/src/app/components/PostCards/PostCards.tsx`
- Modify: `front/src/app/components/PostCards/Buttons/buttons.tsx`
- Modify: `front/src/app/components/LeftSide.tsx`
- Modify: `front/src/app/components/RightSide.tsx`
- Modify: `front/src/app/github_login/page.tsx`

**Interfaces:**

- `apiFetch(path, init)` enviará `credentials: 'include'`, cabeceras JSON y tratará `401` de forma uniforme.
- `AuthProvider` expondrá `user`, `loading`, `startGuestSession()` y `logout()` sin añadir elementos visuales nuevos.
- La pantalla inicial tendrá `LogIn (No credentials)` y no mostrará campos de correo, contraseña ni un botón GitHub activo.

- [ ] **Step 1: Crear el cliente API único**

Centralizar las llamadas para que ningún componente lea `localStorage` ni construya manualmente tokens. El cliente debe convertir respuestas `401` en un evento de sesión expirada.

- [ ] **Step 2: Sustituir la pantalla inicial**

El botón existente debe llamar a `POST /auth/guest`, mostrar estado de carga dentro del mismo botón, gestionar error y redirigir a `/home`. No se añadirá ningún texto ni contenedor nuevo.

- [ ] **Step 3: Crear el provider de sesión**

Al cargar `/home`, llamar a `GET /auth/me`. Si no hay sesión, permitir lectura pública donde corresponda y pedir sesión únicamente al intentar escribir.

- [ ] **Step 4: Migrar componentes existentes al cliente API**

Actualizar publicaciones, comentarios, likes, perfil y feed para usar cookies. Eliminar `localStorage.getItem('token')`, `localStorage.setItem('token', ...)` y el botón que imprime tokens en consola.

- [ ] **Step 5: Implementar logout sin modificar la interfaz**

Conservar `POST /auth/logout` y el método `logout()` del provider para uso futuro, pero no añadir un botón visible en esta fase. No debe intentar eliminar manualmente un JWT que es `HttpOnly`.

- [ ] **Step 6: Ejecutar comprobaciones frontend**

```powershell
cd front
npm ci
npm run build
```

Resultado esperado: build correcto y ninguna referencia a `localStorage`, `/login`, `/github_callback` o `client_id` de GitHub en el flujo normal.

---

## Task 6: CORS, cookies y Docker para despliegue

**Files:**

- Modify: `backend/app.py`
- Modify: `docker-compose.yml`
- Modify: `backend/Dockerfile`
- Modify: `front/Dockerfile`
- Create: `backend/.dockerignore`
- Create: `front/.dockerignore`
- Modify: `.env.example`

**Interfaces:**

- Desarrollo local permitirá `http://localhost:3000` explícitamente.
- Producción usará una lista explícita de orígenes HTTPS.
- MySQL no publicará `3306` en producción.

- [ ] **Step 1: Restringir CORS**

Eliminar `origins='*'` y permitir únicamente `FRONTEND_ORIGIN`. Activar `supports_credentials=True` solo con orígenes concretos.

- [ ] **Step 2: Configurar cookie por entorno**

Usar `HttpOnly=True`, `SameSite='Lax'`, `Secure=COOKIE_SECURE`, `Max-Age` igual a la expiración JWT y nombre estable `access_token`.

- [ ] **Step 3: Añadir `.dockerignore`**

Ignorar al menos `node_modules`, `.next`, `__pycache__`, `*.pyc`, `.venv`, `venv`, `.env`, `.git`, logs y archivos de IDE.

- [ ] **Step 4: Separar variables del frontend**

Eliminar `env_file: .env` del servicio `front`. Pasar únicamente `NODE_ENV` y las variables públicas necesarias.

- [ ] **Step 5: Preparar el backend para producción**

Desactivar `debug=True`, mover el arranque de datos de demostración a un comando explícito y usar un servidor WSGI adecuado en la imagen de producción. Mantener una configuración de desarrollo separada si se necesita `flask run`.

- [ ] **Step 6: Validar Compose**

```powershell
docker compose config --quiet
docker compose config --services
```

Resultado esperado: configuración válida y servicios `db-mysql`, `backend` y `front`.

---

## Task 7: Rate limiting, moderación y ciclo de vida de invitados

**Files:**

- Modify: `backend/requirements.txt`
- Create: `backend/rate_limits.py`
- Create: `backend/moderation.py`
- Modify: `backend/app.py`
- Modify: `backend/SQL/models.py`
- Test: `backend/tests/test_abuse_controls.py`

**Interfaces:**

- Publicaciones, comentarios y likes tendrán límites por `jti` y por IP.
- El modelo de usuario tendrá estado `active`, `suspended` o `blocked`.
- Un usuario suspendido recibirá `403` aunque su JWT sea criptográficamente válido.

- [ ] **Step 1: Probar límites**

Verificar que una ráfaga superior al límite devuelve `429`, que las lecturas públicas no quedan bloqueadas por el límite de escritura y que dos invitados no comparten contador.

- [ ] **Step 2: Implementar límites conservadores**

Aplicar límites separados para publicaciones, comentarios, likes y creación de sesiones. Registrar el resultado sin almacenar contenido sensible.

- [ ] **Step 3: Añadir denuncias y moderación**

Crear endpoints autenticados para denunciar contenido y endpoints de moderador para ocultarlo. Solo moderadores o administradores podrán cambiar el estado de moderación.

- [ ] **Step 4: Definir limpieza de invitados**

Guardar `last_seen_at` y documentar una tarea de limpieza que elimine únicamente invitados inactivos que no tengan contenido, o que anonimice sus datos si el contenido debe conservarse. No ejecutar borrado automático sin política aprobada.

- [ ] **Step 5: Ejecutar pruebas de abuso**

```powershell
pytest tests/test_abuse_controls.py -q
```

---

## Task 8: Migraciones, pruebas integradas y conservación histórica de GitHub

**Files:**

- Create: `backend/migrations/002_guest_sessions.sql`
- Create: `backend/tests/test_end_to_end_guest_flow.py`
- Modify: `backend/requirements.txt`
- Modify: `AGENTS.md`
- Modify: `front/src/app/github_login/page.tsx`
- Modify: GitHub-specific routes and imports in `backend/app.py`

- [ ] **Step 1: Ejecutar migraciones sobre una copia de la base de datos**

Realizar backup, aplicar migraciones en una base temporal y comprobar que usuarios, posts, comentarios y likes históricos siguen siendo legibles.

- [ ] **Step 2: Crear prueba de flujo completo**

La prueba debe ejecutar: crear sesión anónima, consultar `/auth/me`, crear post, leer `/cards`, comentar, dar like, retirar like, cerrar sesión y confirmar que la cookie ya no autoriza una mutación.

- [ ] **Step 3: Verificar aislamiento de usuarios**

Crear dos sesiones anónimas y comprobar que la segunda no puede modificar ni eliminar contenido de la primera aunque envíe su ID en el JSON.

- [ ] **Step 4: Desactivar y conservar GitHub como referencia histórica**

Buscar todas las referencias a `Github`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `/github_callback` y la carpeta `github_login`. Mantenerlas comentadas y agrupadas bajo encabezados `HISTORICAL GITHUB LOGIN (DISABLED)`. No borrar claves, dependencias ni código histórico; comprobar que ningún bloque histórico se ejecute o sea alcanzable desde el flujo normal.

- [ ] **Step 5: Ejecutar la batería final**

```powershell
cd backend
pytest -q
cd ..\front
npm ci
npm run build
cd ..
docker compose config --quiet
docker compose build
```

Resultado esperado: pruebas backend correctas, build frontend correcto, Compose válido e imágenes construibles.

## Checklist de aceptación

- [ ] Un visitante puede abrir la web sin GitHub, correo ni contraseña.
- [ ] El botón `LogIn (No credentials)` crea una sesión JWT anónima.
- [ ] El JWT no aparece en `localStorage`, HTML, JSON de respuesta ni logs.
- [ ] El visitante puede leer contenido público sin sesión.
- [ ] El usuario anónimo puede publicar, comentar, dar like y retirar like.
- [ ] Dos sesiones anónimas no pueden actuar como la misma identidad.
- [ ] Nadie puede escribir directamente en MySQL desde Internet.
- [ ] Las mutaciones sin JWT devuelven `401`.
- [ ] Las mutaciones de un usuario suspendido devuelven `403`.
- [ ] Un usuario no puede modificar contenido ajeno.
- [ ] Los likes duplicados quedan impedidos por la base de datos.
- [ ] CORS solo acepta los orígenes configurados.
- [ ] Debug y seeds de demostración no forman parte del despliegue normal; las referencias GitHub quedan comentadas y desactivadas.
- [ ] Se documenta que borrar cookies elimina la capacidad de recuperar la sesión anónima.
