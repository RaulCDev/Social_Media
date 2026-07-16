# Diseño de restauración de GitHub OAuth y documentación local

Fecha: 16 de julio de 2026

Estado: aprobado para planificación

Rama de trabajo: `feature/github-oauth-documentation`

## 1. Objetivo

Preparar Social Media como un proyecto de portfolio que cualquier persona con
Docker y una cuenta de GitHub pueda ejecutar localmente. La aplicación no se
desplegará públicamente.

El trabajo sustituirá únicamente la autenticación Guest por un inicio de sesión
obligatorio con GitHub. Se conservarán la interfaz actual, las correcciones de
layout, los datos demo, la autorización de las mutaciones y la infraestructura
Docker existente.

También se creará documentación técnica y visual que sirva tanto para probar el
repositorio como para redactar posteriormente un documento narrativo sobre el
proyecto y el contexto en el que fue realizado.

## 2. Alcance

### Incluido

- Restaurar el texto `LogIn with GitHub` y el icono de GitHub en el botón.
- Implementar GitHub OAuth Authorization Code con `state` y PKCE.
- Exigir una sesión GitHub para entrar en `/home` y ejecutar mutaciones.
- Mantener la sesión propia de la aplicación en una cookie `HttpOnly`.
- Identificar usuarios mediante el ID estable de GitHub.
- Actualizar Docker Compose y `.env.example` para un arranque reproducible.
- Mantener el seed idempotente de 10 usuarios y al menos 30 posts demo.
- Sustituir el README genérico por documentación real del proyecto.
- Crear una guía visual con capturas reales de la aplicación.
- Añadir diagnóstico y solución de errores habituales.

### Excluido

- Despliegue en Vercel, Koyeb, Render u otro proveedor.
- Modo de producción de solo lectura.
- Rediseño general de las pantallas internas.
- Login por email y contraseña.
- GitHub App con permisos sobre repositorios.
- Guardar o reutilizar el token OAuth de GitHub después del login.
- Borrar automáticamente antiguos usuarios Guest de bases existentes.

La rama cancelada `deployment/production-readonly` permanecerá separada y no se
fusionará en este trabajo.

## 3. Enfoques considerados

### Revertir commits completos

Se descarta porque eliminaría mejoras válidas realizadas después del OAuth
histórico: cookies `HttpOnly`, autorización basada en `g.current_user`, límites
de abuso, Docker actualizado, datos demo e interfaz corregida.

### Recuperar literalmente el OAuth histórico

Se descarta porque exponía el `client_id` en el frontend, no validaba `state`,
guardaba tokens en `localStorage`, almacenaba el token GitHub en la base de
datos y confiaba en cabeceras construidas por el navegador.

### Sustituir solo la identidad Guest por GitHub OAuth seguro

Es el enfoque elegido. Conserva la arquitectura y las defensas actuales, cambia
la fuente de identidad y restaura únicamente el aspecto solicitado del botón.

## 4. Arquitectura de autenticación

```text
Navegador                    Flask                         GitHub
   |                           |                              |
   | GET /auth/github/start    |                              |
   |-------------------------->| genera state + PKCE          |
   |                           |----------------------------->|
   |<--------------------------| redirect a autorización      |
   |--------------------------------------------------------->|
   |                           |<-----------------------------|
   |                           | callback con code + state     |
   |                           | valida state                  |
   |                           | canjea code + verifier        |
   |                           | obtiene usuario y email       |
   |                           | crea/actualiza usuario        |
   |<--------------------------| cookie HttpOnly + /home       |
```

El frontend no recibirá el secreto OAuth, el token OAuth de GitHub ni el JWT de
la aplicación. Solo utilizará peticiones con `credentials: include`.

## 5. Flujo OAuth

### Inicio

`GET /auth/github/start` realizará lo siguiente:

1. Comprobar que `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` y
   `GITHUB_CALLBACK_URL` están configurados.
2. Generar un `state` aleatorio criptográficamente seguro.
3. Generar un `code_verifier` PKCE y su `code_challenge` SHA-256.
4. Guardar `state` y `code_verifier` en cookies temporales `HttpOnly`,
   `SameSite=Lax`, con duración máxima de diez minutos.
5. Redirigir a GitHub solicitando únicamente `user:email`.

En local las cookies no usarán `Secure`; la configuración conservará la opción
para HTTPS sin introducir un despliegue dentro del alcance.

### Callback

`GET /auth/github/callback`:

1. Tratará de forma explícita `error=access_denied` y errores devueltos por
   GitHub.
2. Exigirá `code`, `state` y las cookies temporales.
3. Comparará los estados en tiempo constante.
4. Canjeará el código mediante el backend, enviando también el `code_verifier`.
5. Solicitará `/user` y `/user/emails` con el token temporal.
6. Exigirá un email verificado y preferirá el email primario.
7. Creará o actualizará la identidad local.
8. Descartará el token GitHub sin almacenarlo.
9. Emitirá el JWT propio en la cookie `access_token`.
10. Eliminará las cookies temporales y redirigirá a `/home`.

Un callback inválido limpiará las cookies temporales y volverá a la pantalla de
inicio con un código de error no sensible en la URL. La pantalla mostrará un
mensaje comprensible y permitirá reintentar.

## 6. Identidad y modelo de datos

`User` incorporará `github_id`, entero grande, único y anulable para mantener
compatibilidad con los usuarios demo existentes.

Reglas de asociación:

- Un usuario ya asociado se buscará siempre por `github_id`.
- Para una primera asociación, podrá reutilizarse un usuario histórico solo si
  su email coincide con un email verificado devuelto por GitHub.
- Si no existe coincidencia segura, se creará un usuario.
- `username`, `accountname` y `avatarUrl` se actualizarán desde GitHub en cada
  inicio de sesión.
- Una colisión de `username` se resolverá con un sufijo derivado de
  `github_id`, sin sobrescribir otro usuario.
- Los usuarios autenticados por GitHub tendrán `is_guest=False`.
- Las filas Guest antiguas podrán permanecer, pero ningún JWT válido podrá
  autenticarlas.

La columna histórica `access_token` permanecerá anulable por compatibilidad de
esquema, pero el código activo no almacenará allí tokens GitHub ni JWT.

Se añadirá una migración idempotente para `github_id` y su índice único. El seed
de una base nueva seguirá funcionando mediante los modelos actuales.

## 7. Sesión y autorización

El JWT propio conservará `sub`, `jti`, `iat` y `exp`, y añadirá una marca de
proveedor `auth_provider=github`. Su validación exigirá:

- firma y expiración válidas;
- usuario existente y activo;
- `github_id` presente;
- `is_guest=False`;
- token no revocado.

`require_jwt` seguirá exponiendo exclusivamente `g.current_user`. Las rutas
`/post`, `/comment`, `/like`, `/unlike`, reportes y moderación nunca confiarán
en IDs, emails ni tokens enviados dentro del JSON del navegador.

Se conservarán:

- `GET /auth/me` para restaurar la sesión;
- `POST /auth/logout` para revocar el JWT y eliminar la cookie.

Se eliminará el flujo activo `/auth/guest`, su creación automática de usuarios
y su llamada desde el frontend. Un visitante sin sesión que intente abrir una
ruta privada será enviado a la pantalla de login.

## 8. Interfaz

La composición visual actual de la pantalla de entrada se conservará:

- fondo negro;
- bloque centrado;
- iconos sociales existentes;
- tamaño y posición actuales.

El único cambio visual deliberado será restaurar el botón:

```text
LogIn with [icono GitHub]
```

Al pulsarlo, el navegador irá a `/auth/github/start`. Mientras comienza la
navegación, el botón quedará deshabilitado para evitar dobles clics.

La página histórica `github_login` dejará de intercambiar códigos desde
JavaScript. El callback será completamente de backend y esa ruta frontend se
convertirá en una redirección compatible a `/`.

Las pantallas internas conservarán el layout actual. El nombre, handle y avatar
del usuario conectado procederán de `/auth/me`.

## 9. Docker reproducible

El flujo soportado será:

1. Instalar Git y Docker Desktop o Docker Engine con Compose v2.
2. Clonar el repositorio.
3. Crear una OAuth App personal en GitHub.
4. Configurar en GitHub:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL:
     `http://localhost:5000/auth/github/callback`
5. Copiar `.env.example` como `.env`.
6. Introducir credenciales y secretos locales.
7. Ejecutar `docker compose up --build`.
8. Abrir `http://localhost:3000`.

`.env.example` documentará al menos:

- `GITHUB_CLIENT_ID`;
- `GITHUB_CLIENT_SECRET`;
- `GITHUB_CALLBACK_URL`;
- `FRONTEND_URL`;
- secretos Flask y JWT;
- credenciales MySQL locales.

Docker Compose pasará las variables GitHub solo al backend. El frontend no
recibirá `GITHUB_CLIENT_SECRET` ni el archivo `.env` completo.

El arranque conservará la espera de salud de MySQL y el seed idempotente de los
datos demo. Reiniciar los servicios no duplicará usuarios ni posts.

## 10. Documentación del repositorio

### `README.md`

Será la entrada principal e incluirá:

- descripción breve y captura principal;
- objetivo y estado del proyecto;
- tecnologías observadas en el repositorio;
- funcionalidades implementadas;
- arquitectura resumida;
- requisitos;
- registro de la GitHub OAuth App;
- arranque rápido con Docker;
- URLs locales;
- comandos de parada, logs, tests y reconstrucción;
- enlaces al resto de documentación.

### `docs/PROJECT_CONTEXT.md`

Recogerá hechos verificables sobre la evolución del proyecto:

- propósito técnico;
- inspiración visual tipo red social;
- decisiones arquitectónicas;
- problemas resueltos;
- evolución de autenticación y Docker;
- aprendizajes demostrables;
- límites actuales.

No inventará fechas, motivaciones personales, contexto académico o experiencia
no confirmada. Esos datos se añadirán después mediante una conversación con el
autor, usando este documento como base.

### `docs/ARCHITECTURE.md`

Explicará componentes, límites de confianza, tablas principales, flujo OAuth,
flujo de creación de posts y responsabilidades de cada contenedor.

### `docs/USER_GUIDE.md`

Explicará el recorrido real:

- inicio con GitHub;
- home y feed;
- navegación lateral;
- creación de posts;
- comentarios y likes;
- perfiles;
- tendencias y recomendaciones.

### `docs/TROUBLESHOOTING.md`

Cubrirá:

- callback de GitHub incorrecto;
- credenciales ausentes o inválidas;
- puertos 3000, 5000 o 3306 ocupados;
- MySQL no saludable;
- cookies o sesiones antiguas;
- reconstrucción de imágenes;
- reinicio opcional de datos con advertencia destructiva explícita.

### `front/README.md`

El README genérico de Create Next App será sustituido por una referencia breve
al README raíz y por los comandos específicos del frontend.

## 11. Documentación visual

Las capturas se guardarán en `docs/assets/screenshots/` con nombres estables y
texto alternativo descriptivo. Como mínimo:

- `01-login-github.png`;
- `02-home-feed.png`;
- `03-navigation-section.png`;
- `04-create-post.png`;
- `05-post-interactions.png`;
- `06-profile.png`.

Las imágenes se generarán desde la aplicación real levantada con Docker, no a
partir de mockups. Antes de versionarlas se comprobará que no muestran secretos,
tokens, paneles de GitHub ni información privada. Los nombres públicos de
GitHub visibles se tratarán como datos públicos; cualquier dato innecesario se
excluirá encuadrando la captura en la aplicación.

La guía visual explicará qué demuestra cada captura y cómo se relaciona con la
arquitectura.

## 12. Errores y seguridad

- El backend fallará de forma clara si faltan credenciales OAuth.
- Nunca se registrarán códigos OAuth, tokens, cookies ni secretos.
- Las respuestas de GitHub se solicitarán en JSON y se validarán antes de
  usarse.
- Las peticiones externas tendrán timeout.
- Los errores de red o GitHub devolverán al login sin trazas internas.
- `state` y PKCE serán obligatorios y de un solo uso práctico al borrarse sus
  cookies en el callback.
- El token GitHub solo existirá en memoria durante el callback.
- `.env` seguirá ignorado por Git.

## 13. Estrategia de pruebas

### Backend

- El inicio genera `state`, PKCE, cookies temporales y redirect correctos.
- Faltan credenciales: respuesta controlada, sin redirect roto.
- Callback sin código, sin estado o con estado incorrecto: rechazo.
- Acceso denegado por el usuario: retorno limpio al login.
- GitHub token, usuario y emails se simulan; los tests no llaman a Internet.
- Se elige el email primario verificado.
- Se rechaza una identidad sin email verificado.
- Se crea un usuario nuevo y se actualiza uno existente por `github_id`.
- Se asocia de forma segura un usuario histórico por email verificado.
- Una colisión de username no sobrescribe otra cuenta.
- El token GitHub no queda almacenado.
- El JWT GitHub restaura sesión, autoriza mutaciones y puede revocarse.
- Un JWT Guest antiguo es rechazado.
- La suite existente de posts, comentarios, likes y moderación sigue pasando.
- La migración `github_id` es idempotente en MySQL 8.

### Frontend

- El botón muestra texto e icono GitHub.
- El clic navega al endpoint de inicio del backend.
- La restauración usa `/auth/me` y no crea Guest.
- Un usuario no autenticado no accede a `/home`.
- Un error OAuth visible permite reintentar.
- Ningún código activo usa `localStorage`, Bearer manual o secretos GitHub.
- Las mejoras actuales de layout siguen cubiertas por sus tests.

### Integración y Docker

- `docker compose config --quiet`.
- Builds de los dos Dockerfiles.
- Arranque desde una base vacía.
- Seed idempotente tras reiniciar el backend.
- Login real manual con las credenciales locales del autor.
- Creación de post, comentario, like, unlike y logout.
- Capturas tomadas después de completar el recorrido.
- Revisión final para confirmar que `.env` y secretos no están versionados.

## 14. Criterios de aceptación

El trabajo estará terminado cuando:

- no exista un flujo Guest activo;
- el botón `LogIn with GitHub` conserve el layout actual;
- GitHub OAuth funcione con `state`, PKCE y callback de backend;
- el navegador nunca reciba tokens OAuth o JWT legibles por JavaScript;
- las identidades y mutaciones utilicen `g.current_user`;
- una persona pueda arrancar el proyecto siguiendo únicamente el README;
- el único requisito manual adicional sea crear su propia GitHub OAuth App;
- los datos demo se carguen sin duplicarse;
- tests, builds y validación Compose pasen;
- la documentación técnica y visual esté completa y enlazada;
- las capturas no expongan secretos ni información privada innecesaria.

## 15. Referencias técnicas

- Flujo web OAuth de GitHub:
  <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps>
- Emails del usuario autenticado:
  <https://docs.github.com/en/rest/users/emails>
- Buenas prácticas de OAuth Apps:
  <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/best-practices-for-creating-an-oauth-app>
