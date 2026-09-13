# Sticker Collect - Sistema de Gestión e Intercambio de Láminas

Plataforma web estilo "Cromos de Steam" para la gestión, seguimiento y publicación de colecciones de láminas y álbumes de la comunidad. Desarrollada con arquitectura desacoplada: API REST en **NestJS** y frontend en **Astro** (SSR).

## 🎯 Brief Funcional

Sticker Collect permite a usuarios registrados gestionar álbumes de láminas y llevar control de colecciones propias o compartidas por la comunidad.

- **Creador:** crea álbumes, edita información, sube portada, carga láminas, publica o mantiene privado cada álbum, y elimina álbumes mediante borrado lógico.
- **Coleccionista:** explora álbumes compartidos, comienza a seguir una colección, marca láminas obtenidas, identifica faltantes y administra repetidas con controles `+` y `-`.
- **Sistema:** protege rutas mediante JWT, valida acciones sensibles por propietario o seguidor, guarda datos en MariaDB y almacena imágenes localmente en `/uploads`.

## 📌 Solicitud Inicial del Proyecto

> “El proyecto final del curso involucra la creación de un sistema de gestión para coleccionistas de láminas de álbumes, utilizando Spring Boot. Este sistema permitirá a los usuarios gestionar sus colecciones de manera eficiente, desde la creación de álbumes hasta el seguimiento de las láminas faltantes y repetidas. El sistema debe ser desarrollado como un proyecto Maven utilizando Spring Initializr, conectarse a una base de datos MySQL, y proporcionar una API REST que soporte operaciones CRUD sobre los álbumes y sus láminas.”

## ✅ Cumplimiento de la Solicitud

La solución desarrollada cumple el objetivo funcional solicitado: un sistema de gestión para coleccionistas de láminas que permite crear álbumes, administrar sus láminas, publicar álbumes en la comunidad, seguir colecciones y controlar láminas obtenidas, faltantes y repetidas.

- **Gestión de álbumes:** El módulo `albums` del backend permite crear, listar, editar y eliminar álbumes mediante una API REST protegida con JWT.
- **Gestión de láminas:** El módulo `stickers` permite cargar láminas de forma masiva, listarlas, editarlas y eliminarlas dentro de un álbum.
- **Seguimiento de colecciones:** El módulo `collection` permite seguir álbumes, dejar de seguirlos y consultar el estado del libro del coleccionista.
- **Láminas faltantes y repetidas:** El backend calcula estadísticas de colección considerando cantidad total, obtenidas, faltantes y repetidas según la cantidad registrada por usuario.
- **Base de datos MySQL/MariaDB:** La persistencia se implementó con MariaDB, compatible con el requerimiento de MySQL, usando TypeORM para mapear entidades relacionales.
- **API REST:** El backend expone endpoints REST para autenticación, álbumes, láminas y colecciones.
- **Frontend funcional:** Astro SSR consume la API REST mediante rutas BFF, renderiza las vistas protegidas y permite operar el sistema desde formularios e interacciones en navegador.

### Adaptación tecnológica realizada

La solicitud inicial menciona Spring Boot, Maven y Spring Initializr. En este repositorio la implementación real no utiliza Spring Boot ni Maven; se desarrolló con **NestJS sobre Node.js** para el backend y **Astro SSR** para el frontend. Esta adaptación mantiene la arquitectura solicitada de API REST + base de datos relacional MySQL/MariaDB, pero cambia el framework backend por uno modular basado en TypeScript.

## 🛠️ Stack Tecnológico

- **Backend:** NestJS (v12), Node.js, TypeScript, TypeORM, **MariaDB**, JWT, Bcrypt, **Multer** (para la gestión local de archivos e imágenes).
- **Frontend:** Astro (v7) en modo SSR. Rutas API nativas de Astro actuando como **BFF (Backend for Frontend)**. Componentes y scripts en **Vanilla JavaScript** para la interactividad en tiempo real, sin depender de frameworks adicionales.
- **Almacenamiento:** MariaDB para el modelo relacional; sistema de archivos local (`/uploads`) para imágenes de portadas y láminas.

## ✅ Justificación del Stack

- **Node.js + NestJS:** Se utiliza NestJS sobre Node.js porque está basado en Express por defecto y organiza el backend mediante módulos, controladores y servicios. Esto permite construir una API REST más intuitiva, separada por responsabilidades y fácil de mantener a medida que crecen dominios como autenticación, álbumes, láminas y colecciones.
- **MySQL/MariaDB:** MariaDB fue elegido porque el uso de MySQL/MariaDB forma parte de los requerimientos del proyecto. Además, el modelo del sistema es relacional por naturaleza: usuarios, álbumes, láminas, álbumes seguidos e inventario de láminas se representan mediante entidades relacionadas y claves foráneas.
- **Astro SSR:** Se utilizó Astro en modo SSR (Server Side Rendering) por la cercanía del equipo con el framework y porque facilita consumir la API REST del backend desde el servidor. Sus rutas API permiten actuar como BFF, manejar formularios y cookies de autenticación, y al mismo tiempo desarrollar una interfaz visual cuidada con poca carga de JavaScript en el cliente.
- **Tailwind CSS 4:** Se utiliza Tailwind 4 para acelerar el desarrollo visual y mantener una interfaz consistente mediante clases utilitarias. Esto encaja con el diseño del proyecto, que usa tarjetas, estados visuales, colores oscuros, efectos holográficos y layouts responsivos sin agregar frameworks UI adicionales.
- **pnpm separado por frontend/backend:** Cada capa mantiene su propio `package.json`, `pnpm-lock.yaml` y scripts. Esta separación simplifica la instalación, ejecución y mantenimiento independiente del backend y frontend, evitando mezclar dependencias que cumplen responsabilidades distintas.
- **Vitest + Oxlint en backend:** Vitest entrega una base moderna para pruebas unitarias/e2e del backend, mientras Oxlint permite verificar problemas comunes de TypeScript de forma rápida. Aunque actualmente no se observaron archivos de prueba, los scripts ya están preparados para validar el backend.
- **Multer + uploads locales:** Multer permite recibir imágenes de portadas y láminas mediante `multipart/form-data`. El almacenamiento local en `/uploads` es suficiente para el alcance del proyecto, facilita el desarrollo local y evita depender de servicios externos de archivos.

## 🧩 Diagrama de Arquitectura

```text
Navegador
  │
  ▼
Frontend Astro SSR
  ├─ Páginas .astro protegidas por cookie JWT
  ├─ Componentes UI y scripts Vanilla JavaScript
  └─ Rutas /api/* como BFF
        │
        ▼
Backend NestJS REST API
  ├─ AuthModule: registro, login y JWT
  ├─ AlbumsModule: CRUD de álbumes
  ├─ StickersModule: CRUD/carga de láminas
  └─ CollectionModule: seguimiento e inventario
        │
        ├─ MariaDB/MySQL mediante TypeORM
        └─ Sistema de archivos local en backend/uploads
```

## 📂 Estructura del Proyecto

```text
stickers-platform/
├── backend/            # API REST (NestJS)
│   └── src/
│       ├── auth/       # Autenticación JWT y usuarios
│       ├── albums/     # CRUD de álbumes y portadas (Multer)
│       ├── stickers/   # CRUD de láminas individuales y en lote (Multer)
│       └── collection/ # Lógica de inventario de coleccionistas (Obtenidas/Repetidas)
│
├── frontend/           # Aplicación Web SSR (Astro)
│   └── src/
│       ├── components/ # Componentes UI reutilizables (AlbumCard, StickerCard)
│       ├── pages/api/  # Rutas BFF para interceptar FormData y ocultar peticiones al backend
│       └── pages/      # Vistas protegidas (Dashboard, My-Albums, My-Collection)
│
└── README.md           # Guía general del proyecto
```

## 🚀 Cómo levantar el proyecto en local

No existe `package.json` raíz. Backend y frontend se instalan y ejecutan por separado.

1. Instalar prerrequisitos:
   - Node.js `>=22.12.0`.
   - `pnpm`.
   - Docker Desktop o una instancia MariaDB/MySQL local compatible.

2. Crear variables de entorno locales desde los ejemplos:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   En Windows PowerShell:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

3. Levantar la base de datos desde la raíz del proyecto:

   ```bash
   docker compose up db
   ```

4. Levantar el backend en otra terminal:

   ```bash
   cd backend
   pnpm install
   pnpm run start:dev
   ```

   La API queda disponible en `http://localhost:3000`.

5. Levantar el frontend en otra terminal:

   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

   Abrir la URL que muestre Astro en consola, normalmente `http://localhost:4321`.

## 🚀 Comandos Reales del Proyecto

No existe `package.json` raíz. Los comandos se ejecutan desde la carpeta correspondiente.

### Prerrequisitos

- Node.js >= 22.x para el frontend.
- Gestor de paquetes `pnpm`.
- Docker o una instancia local de MariaDB/MySQL compatible.

### Base de datos local

Desde la raíz del proyecto:

```bash
docker compose up db
```

El servicio usa `mariadb:latest`, expone el puerto `3306` y monta datos en `db_data/`.

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

- `pnpm run start:dev` inicia NestJS en modo observación.
- `pnpm run build` genera `dist/`.
- `pnpm run start:prod` ejecuta `node dist/main`; requiere build previo.
- `pnpm run lint` ejecuta `oxlint src/ test/`.
- `pnpm run test` busca archivos `**/*.spec.ts`.
- `pnpm run test:e2e` busca archivos `**/*.e2e-spec.ts`.

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

- `pnpm run dev` inicia Astro en desarrollo.
- `pnpm run build` compila la aplicación SSR.
- `pnpm run preview` permite previsualizar el build.
- No hay scripts `lint`, `test` ni `check` definidos en `frontend/package.json`.

## 🔐 Variables de Entorno

Crear archivos `.env` locales a partir de los `.env.example`. No subir `.env` con secretos reales.

### Backend (`backend/.env.example`)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=album_db
JWT_SECRET=super_secret_key_album_app_2026
```

### Frontend (`frontend/.env.example`)

```env
BACKEND_URL=http://localhost:3000
```

## 🗃️ Modelo de Datos Resumido

```text
User 1 ── * Album
User 1 ── * UserAlbum * ── 1 Album
Album 1 ── * Sticker
User 1 ── * UserSticker * ── 1 Sticker
```

- **User:** usuario autenticado; contiene `id`, `email`, `password_hash`.
- **Album:** colección creada por un usuario; contiene `name`, `description`, `cover_image`, `is_shared`, `is_active`, `created_at`.
- **Sticker:** lámina de un álbum; contiene `number`, `name`, `image`, `sticker_type`.
- **UserAlbum:** relación de seguimiento entre usuario y álbum; contiene `started_at`.
- **UserSticker:** inventario del usuario sobre una lámina; contiene `quantity` y restricción única por usuario/lámina.

## 🌐 Endpoints Principales

### Autenticación

- `POST /auth/register`
- `POST /auth/login`

### Álbumes

- `POST /albums`
- `GET /albums/my-albums`
- `GET /albums/community`
- `GET /albums/:id`
- `PUT /albums/:id`
- `DELETE /albums/:id`

### Láminas

- `POST /albums/:albumId/stickers/bulk`
- `GET /albums/:albumId/stickers`
- `GET /albums/:albumId/stickers/:stickerId`
- `PUT /albums/:albumId/stickers/:stickerId`
- `DELETE /albums/:albumId/stickers/:stickerId`

### Colecciones

- `POST /collection/albums/:id/follow`
- `DELETE /collection/albums/:id/unfollow`
- `GET /collection/my-followed`
- `GET /collection/albums/:id/book`
- `POST /collection/stickers/:id/add`
- `POST /collection/stickers/:id/remove`

---

## 🔒 Roles y Características Principales

El sistema maneja un control estricto de autorizaciones, protegiendo contra vulnerabilidades **IDOR (Insecure Direct Object Reference)** tanto a nivel de backend como de renderizado en Astro.

- **Panel del Creador (Owner):** 
  - Crea, edita y elimina sus propios álbumes.
  - Sube imágenes de portadas y carga láminas (de forma masiva o individual) con fotos personalizadas.
  - Puede mantener sus creaciones privadas o compartirlas con la **Comunidad**.
- **Panel del Coleccionista (Follower):** 
  - Explora el dashboard buscando álbumes públicos de la comunidad.
  - Puede "Comenzar Colección" para hacer seguimiento de un álbum.
  - Interactúa en tiempo real con su "Colección" usando botones (`+`, `-`) para marcar láminas obtenidas, faltantes o gestionar repetidas.
  - Manejo seguro de colecciones "fantasma" (si un creador borra o privatiza un álbum que el usuario estaba coleccionando).

## ⚡ Decisiones de Arquitectura

- **BFF (Backend for Frontend):** El frontend en Astro procesa los formularios (`multipart/form-data`) a través de sus propias rutas `/api/*`. Astro extrae la cookie JWT, ensambla la petición y se comunica de forma segura con NestJS en el servidor, manteniendo el token invisible para el cliente.
- **Interactividad Ligera:** En lugar de cargar librerías como React o Vue, se utiliza JavaScript puro manipulando el DOM para actualizar estadísticas (Faltantes, Obtenidas, Repetidas) en tiempo real, ofreciendo una carga extremadamente rápida.