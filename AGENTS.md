# AGENTS.md

Guía para agentes de IA que trabajen en este repositorio. Basada solo en archivos existentes revisados en este estado del proyecto.

## Proyecto

Sticker Collect es una plataforma web para gestionar colecciones de láminas o stickers y álbumes de comunidad. El objetivo funcional observado es permitir registro/login, creación de álbumes por usuarios, carga de láminas, publicación de álbumes compartidos, seguimiento de álbumes de otros usuarios y control de inventario por cantidad de láminas obtenidas/repetidas.

Arquitectura desacoplada:

- `backend/`: API REST en NestJS.
- `frontend/`: aplicación Astro SSR con rutas API internas que actúan como BFF hacia el backend.
- `docker-compose.yml`: servicio MariaDB local.

## Estructura del repositorio

```text
.
├── AGENTS.md
├── architecture.md
├── docker-compose.yml
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── nest-cli.json
│   ├── oxlint.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── vitest.config.ts
│   ├── vitest.config.e2e.ts
│   ├── .env.example
│   ├── .prettierrc
│   ├── .gitignore
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── auth/
│       ├── albums/
│       ├── stickers/
│       └── collection/
└── frontend/
    ├── package.json
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── astro.config.mjs
    ├── tsconfig.json
    ├── README.md
    ├── AGENTS.md
    ├── CLAUDE.md
    ├── .env.example
    ├── .gitignore
    ├── public/
    └── src/
        ├── components/
        ├── layouts/
        ├── pages/
        │   ├── api/
        │   ├── albums/
        │   ├── my-albums/
        │   └── my-collection/
        └── styles/
```

No `package.json` raíz observado. `backend/` y `frontend/` tienen lockfiles separados y deben tratarse como proyectos pnpm separados.

## Stack tecnológico observado

### Backend

- Node.js: requerido indirectamente por dependencias; `backend/package.json` no define `engines`.
- TypeScript: `^6.0.2` en package, `6.0.3` resuelto en lockfile.
- NestJS: paquetes `@nestjs/*` versión `^12.0.x`, lockfile con `@nestjs/common` y `@nestjs/core` `12.0.1`.
- TypeORM: `^1.1.1`, lockfile `1.1.1`.
- Base de datos: MySQL driver `mysql2 ^3.24.4`; configuración `type: 'mysql'` apuntando a MariaDB en Docker.
- MariaDB: `mariadb:latest` en `docker-compose.yml`.
- Autenticación: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`.
- Uploads: `multer` y `@nestjs/platform-express` con `diskStorage`.
- Static files: `@nestjs/serve-static`, sirve `uploads/` en `/uploads`.
- Lint: `oxlint`.
- Tests: `vitest`, `@vitest/coverage-v8`, `supertest`; no archivos `*.spec.ts` ni `*.e2e-spec.ts` observados.
- Formato: Prettier con `singleQuote: true` y `trailingComma: all`.

### Frontend

- Node.js: `>=22.12.0` en `frontend/package.json`.
- Astro: `^7.3.2`, lockfile `7.3.2`.
- Astro SSR: `output: 'server'` con adapter `@astrojs/node ^11.1.5` en modo `standalone`.
- Tailwind CSS: `tailwindcss ^4.3.3` y `@tailwindcss/vite ^4.3.3`.
- JWT decode en SSR: `jsonwebtoken ^9.0.3`.
- Interactividad cliente: scripts inline en `.astro`, sin React/Vue/Svelte observados.

## Arquitectura backend

Entrada:

- `backend/src/main.ts`: crea Nest app, habilita CORS global con `app.enableCors()` y escucha `process.env.PORT ?? 3000`.
- `backend/src/app.module.ts`: carga `ConfigModule.forRoot({ isGlobal: true })`, `ServeStaticModule` para `uploads/`, TypeORM async y módulos de dominio.

Módulos:

- `AuthModule`: registro, login, JWT, estrategia Passport.
- `AlbumsModule`: CRUD de álbumes, ownership, soft delete.
- `StickersModule`: CRUD/carga bulk de láminas por álbum.
- `CollectionModule`: seguimiento de álbumes e inventario de usuario.

Patrones observados:

- ESM NodeNext: imports relativos usan extensión `.js` en TypeScript.
- Entidades TypeORM con decoradores.
- Servicios inyectan repositorios con `@InjectRepository`.
- Controladores usan `@UseGuards(JwtAuthGuard)` salvo `AuthController`.
- Carga de archivos escribe en `./uploads/covers` y `./uploads/stickers`.
- `synchronize: true` está activo en TypeORM con comentario `Solo desarrollo`; no hay migraciones observadas.

Endpoints backend observados:

- `POST /auth/register`
- `POST /auth/login`
- `POST /albums`
- `GET /albums/my-albums`
- `GET /albums/community`
- `GET /albums/:id`
- `PUT /albums/:id`
- `DELETE /albums/:id`
- `POST /albums/:albumId/stickers/bulk`
- `GET /albums/:albumId/stickers`
- `GET /albums/:albumId/stickers/:stickerId`
- `PUT /albums/:albumId/stickers/:stickerId`
- `DELETE /albums/:albumId/stickers/:stickerId`
- `POST /collection/albums/:id/follow`
- `DELETE /collection/albums/:id/unfollow`
- `GET /collection/my-followed`
- `GET /collection/albums/:id/book`
- `POST /collection/stickers/:id/add`
- `POST /collection/stickers/:id/remove`

## Arquitectura frontend

Astro SSR usa páginas en `frontend/src/pages/` y BFF en `frontend/src/pages/api/`.

Páginas principales:

- `/login`: formulario hacia `/api/auth/login`.
- `/register`: formulario hacia `/api/auth/register`.
- `/`: dashboard protegido; carga `/collection/my-followed`.
- `/community`: catálogo público autenticado; carga comunidad y seguidos.
- `/albums/[id]`: detalle/lectura del álbum, seguimiento e inventario interactivo si corresponde.
- `/my-albums`: panel creador.
- `/my-albums/new`: crear álbum.
- `/my-albums/[id]`: administrar álbum propio; valida `album.owner.id === user.sub` antes de renderizar.
- `/my-albums/[id]/edit`: editar/eliminar álbum propio; valida owner.
- `/my-albums/[id]/stickers/new`: carga bulk de láminas; valida owner.
- `/my-albums/[id]/stickers/[stickerId]/edit`: editar/eliminar lámina; valida owner.
- `/my-collection/[id]`: redirige a `/albums/[id]`.

BFF observado:

- `api/auth/login.ts`, `register.ts`, `logout.ts`: llaman backend, guardan/borran cookie `jwt`.
- `api/albums/create.ts`, `[id]/update.ts`, `[id]/delete.ts`: transforman formularios y llaman backend.
- `api/albums/[id]/stickers.ts`: arma JSON `stickers` y archivos `image_N` para bulk upload.
- `api/albums/[id]/stickers/[stickerId]/update.ts`, `delete.ts`: proxy de edición/borrado de lámina.
- `api/collection/[id]/follow.ts`, `unfollow.ts`: proxy de seguimiento.
- `api/collection/stickers/[id]/add.ts`, `remove.ts`: endpoints JSON para controles `+` y `-`.

Componentes/layout:

- `Layout.astro`: layout global en español, navegación, footer, `ConfirmModal`, fuente Plus Jakarta Sans por Google Fonts, script global de tilt 3D.
- `AlbumCard.astro`: tarjeta de álbum con props `id`, `name`, `description`, `isShared`, `coverImage`, `actionUrl`, `actionText`.
- `StickerCard.astro`: tarjeta de lámina con props `id`, `albumId`, `number`, `name`, `type`, `image`, `editable`, `isOwned`, `quantity`, `showControls`.
- `ConfirmModal.astro`: dialog global y API `window.showConfirmModal`; intercepta formularios con `data-confirm`.
- `global.css`: importa Tailwind y define estilos/animaciones globales para fondo, holo/special foil, tilt y glare.

## Base de datos y persistencia

Base relacional MariaDB local:

- `docker-compose.yml` define servicio `db` con `mariadb:latest`, puerto `3306:3306`, base `album_db`, volumen `./db_data:/var/lib/mysql`.
- Backend configura TypeORM con `type: 'mysql'` y variables `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`.
- `synchronize: true` genera/sincroniza esquema automáticamente en desarrollo. No hay migraciones observadas.

Entidades TypeORM observadas:

- `User` (`users`): `id`, `email` único, `password_hash`, relación `albums`.
- `Album` (`albums`): `id`, `name`, `description`, `cover_image`, `is_shared`, `is_active`, `created_at`, `owner`, `stickers`.
- `Sticker` (`stickers`): `id`, `number`, `name`, `image`, `sticker_type`, `album`.
- `UserAlbum` (`user_albums`): `id`, `started_at`, `user`, `album`.
- `UserSticker` (`user_stickers`): `id`, `quantity`, `user`, `sticker`, unique `user + sticker`.

Persistencia de archivos:

- Portadas en `backend/uploads/covers`.
- Imágenes de láminas en `backend/uploads/stickers`.
- `backend/uploads` está ignorado por git.

## Autenticación y autorización

Backend:

- Registro/login devuelven `{ access_token }`.
- Passwords se guardan como `password_hash` con `bcrypt.hash(pass, 10)`.
- JWT payload: `{ email, sub: user.id }`.
- JWT expira en `7d`.
- `JwtStrategy` extrae Bearer token desde `Authorization`.
- No se observó modelo de roles persistido; autorización real = usuario autenticado, owner de álbum o follower de álbum.

Frontend:

- BFF guarda cookie `jwt` con `httpOnly: true`, `secure: import.meta.env.PROD`, `path: '/'`, `maxAge` 7 días.
- Páginas protegidas redirigen a `/login` si no existe cookie.
- Páginas SSR usan `jwt.decode(token)` para obtener `email` y `sub`; no verifican firma en frontend.
- BFF adjunta `Authorization: Bearer <token>` hacia backend.

Reglas de autorización observadas:

- Album update/delete verifica owner en backend.
- Sticker create/update/delete verifica owner del álbum en backend.
- Vistas de creador en Astro verifican owner antes de mostrar formularios.
- Collection book/add/remove exige que usuario siga el álbum de la lámina.

## Variables de entorno

No hay `.env` real observado; sí `.env.example` en ambos proyectos.

Backend (`backend/.env.example`):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=album_db
JWT_SECRET=super_secret_key_album_app_2026
```

Frontend (`frontend/.env.example`):

```env
BACKEND_URL=http://localhost:3000
```

Reglas:

- Nunca copiar secretos reales a documentación, commits, issues ni logs.
- `JWT_SECRET` y `DB_PASSWORD` de `.env.example` son ejemplos; para entornos reales deben reemplazarse fuera del repositorio.
- No modificar `.env` locales salvo petición explícita del usuario.

## Comandos reales

Ejecutar desde cada carpeta; no hay script raíz observado.

### Base de datos local

Desde raíz del repositorio:

```bash
docker compose up db
```

Esto usa `docker-compose.yml` y monta datos en `db_data/`. No ejecutar comandos destructivos sobre `db_data/` sin instrucción explícita.

### Backend

Desde `backend/`:

```bash
pnpm install
pnpm run start:dev
pnpm run start
pnpm run build
pnpm run start:prod
pnpm run lint
pnpm run format
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:debug
pnpm run test:e2e
pnpm run deploy
```

Notas:

- `pnpm run start:prod` requiere build previo que genere `dist/`.
- `pnpm run lint` ejecuta `oxlint src/ test/`.
- `pnpm run test` busca `**/*.spec.ts`; no se observaron tests existentes.
- `pnpm run test:e2e` busca `**/*.e2e-spec.ts`; no se observaron tests e2e existentes.
- `pnpm run format` modifica archivos; no ejecutarlo si la tarea prohíbe cambios no solicitados.

### Frontend

Desde `frontend/`:

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
pnpm run astro
```

Notas:

- No hay scripts `lint`, `test` ni `check` definidos en `frontend/package.json`.
- `frontend/AGENTS.md` menciona `astro dev --background`, `astro dev stop`, `astro dev status` y `astro dev logs`; esos comandos no aparecen en `frontend/package.json`. Tratar esa guía como específica de Astro CLI y verificar antes de usar.

## Convenciones existentes

TypeScript/backend:

- `strict: true`, `module: nodenext`, `moduleResolution: nodenext`, `target: ES2023`.
- Imports relativos en backend usan extensión `.js`.
- Nombres de archivos por dominio: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts`.
- Clases PascalCase: `AlbumsService`, `StickersController`, `UserSticker`.
- Campos persistidos usan snake_case en varias entidades: `password_hash`, `cover_image`, `is_shared`, `is_active`, `created_at`, `sticker_type`, `started_at`.
- Controladores usan `any` en bodies/request donde ya existe patrón; oxlint permite `no-explicit-any`.
- Prettier backend: comillas simples y trailing commas.

Astro/frontend:

- Componentes `.astro` en PascalCase dentro de `src/components`.
- Páginas por file-based routing; carpetas dinámicas `[id]`, `[stickerId]`.
- BFF en `src/pages/api/**` exporta `POST` o `GET` de tipo `APIRoute`.
- UI en español.
- Estilo visual dark con Tailwind utilities, slate/sky/indigo/rose/amber, tarjetas redondeadas, sombras y efectos 3D/holográficos.
- SSR obtiene datos con `fetch` desde `BACKEND_URL` y JWT cookie.
- Confirmaciones destructivas usan `data-confirm`, `data-confirm-title`, `data-confirm-btn` y `ConfirmModal` global.

## Archivos y directorios sensibles o generados

No modificar ni subir sin necesidad:

- `.env`, `.env.*`, `frontend/.env`, `backend/.env*` locales.
- `backend/uploads/`: archivos subidos por usuarios, ignorados por git.
- `db_data/`: volumen MariaDB local, ignorado por git raíz.
- `node_modules/` en backend/frontend.
- `backend/dist/`, `frontend/dist/`, `frontend/.astro/`, `backend/coverage/`.
- `backend/tsconfig.build.tsbuildinfo`: artefacto incremental ya presente; evitar tocarlo salvo build inevitable.
- Lockfiles `backend/pnpm-lock.yaml` y `frontend/pnpm-lock.yaml`: modificar solo al cambiar dependencias con autorización.
- `docker-compose.yml`, configs TypeScript/Nest/Astro/lint/test: cambiar solo si la tarea lo exige.

## Reglas para agentes antes de modificar código

1. Leer `AGENTS.md` raíz y cualquier `AGENTS.md` más específico del área tocada, por ejemplo `frontend/AGENTS.md`.
2. Revisar `README.md`, `architecture.md` y los archivos concretos del módulo afectado.
3. No instalar dependencias ni cambiar lockfiles salvo petición explícita.
4. No ejecutar migraciones ni alterar `db_data/`; no hay migraciones observadas.
5. No cambiar `.env` locales ni exponer secretos. Usar `.env.example` solo como referencia de nombres.
6. Mantener la separación `frontend/` BFF SSR y `backend/` API REST.
7. Mantener imports `.js` en TypeScript backend NodeNext.
8. Mantener nombres y campos existentes; no introducir segunda convención para snake_case/PascalCase/rutas.
9. Antes de tocar símbolos exportados o rutas usadas, buscar callsites en backend, frontend y documentación.
10. Para cambios de autorización, validar backend y frontend: el backend debe ser fuente final de permisos; frontend solo evita renderizado indebido.
11. No ocultar errores de backend en el BFF si la tarea toca rutas API; preservar o mejorar manejo real, no simular éxito.
12. No agregar tests solo por cantidad. Si se agregan, deben cubrir comportamiento observable y encajar con Vitest existente.
13. No modificar archivos generados/sensibles listados arriba salvo necesidad clara y autorizada.

## Checklist de término para agentes

Antes de considerar terminada una tarea:

- Confirmar que solo se modificaron archivos dentro del alcance pedido.
- Confirmar que no se modificaron `.env`, `uploads/`, `db_data/`, `node_modules/`, `dist/`, `.astro/` ni lockfiles sin autorización.
- Si cambió backend, ejecutar validación específica disponible desde `backend/`:
  - `pnpm run lint` si la tarea toca TypeScript backend.
  - `pnpm run test` si existen o se agregan specs aplicables.
  - `pnpm run build` si cambió contrato, módulos, entidades o tipos.
- Si cambió frontend, ejecutar validación disponible desde `frontend/`:
  - `pnpm run build` para cambios de páginas/componentes/config.
  - No declarar lint/test/check frontend si no se agregó script real.
- Si cambió comportamiento UI, verificar la ruta real en Astro cuando sea posible.
- Si cambió API/BFF, probar la ruta afectada o hacer smoke test HTTP controlado sin alterar datos reales sensibles.
- Si cambió persistencia, documentar impacto de `synchronize: true` y no tocar datos locales sin autorización.
- Actualizar documentación existente solo si la tarea lo pide o si el cambio deja documentación falsa.

## Problemas, riesgos e inconsistencias detectadas

- `backend/README.md` y `frontend/README.md` son plantillas starter, no documentación específica del proyecto.
- `architecture.md` lista `User.created_at`, pero `backend/src/auth/user.entity.ts` no define `created_at`.
- `architecture.md` dice `Album.owner_id`, `Sticker.album_id` y claves FK explícitas; en código son relaciones TypeORM sin columnas FK declaradas como propiedades.
- No hay archivos de test observados aunque backend define scripts Vitest.
- Backend usa `synchronize: true`; riesgo si se usa fuera de desarrollo.
- `JwtStrategy` permite fallback `JWT_SECRET || 'secret'`, pero `JwtModule` firma con `JWT_SECRET`; configuración ausente puede crear comportamiento inconsistente.
- `.env.example` contiene credenciales débiles de ejemplo (`root/root` y JWT secret fijo); no usarlas en producción.
- `findCommunityAlbums`, `getMyFollowedAlbums` y `StickersService.findOne` cargan relaciones `owner`; revisar exposición de `password_hash` antes de exponer esos resultados.
- `GET /albums/:albumId/stickers` y `GET /albums/:albumId/stickers/:stickerId` no muestran verificación de visibilidad/owner en el servicio leído.
- `CollectionService.followAlbum` no muestra validación de álbum activo/compartido antes de seguir.
- Uploads Multer no muestran límites de tamaño/tipo MIME.
- Frontend usa `jwt.decode` para obtener `sub` y `email`; no verifica firma en SSR.
- Varias rutas BFF de mutación redirigen aunque el backend falle; `add/remove` responden `200` con JSON del backend sin propagar status.
- No se observó protección CSRF explícita para formularios; cookie JWT es HttpOnly pero sin `sameSite` explícito.
