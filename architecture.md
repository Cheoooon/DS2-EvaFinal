# Especificación Técnica y Arquitectura de Dominio

Este documento define la lógica de negocio, el modelo relacional de datos y los contratos API REST acordados para la comunicación entre NestJS y Astro.

---

## 📊 Modelo Entidad-Relación (Base de Datos MariaDB)

```text
 [Users] 1 --- * [Albums] (Created)
    1               1
    |               |
    *               *
[UserAlbums]    [Stickers]
    *               1
    |               |
    +-------+-------+
            |
      [UserStickers]
```

### Entidades

1. **`User`**: `id`, `email`, `password_hash`, `created_at`.
2. **`Album`**: `id`, `owner_id` (FK), `name`, `description`, `cover_image` (string/null), `is_shared` (boolean), `is_active` (boolean, borrado lógico), `created_at`.
3. **`Sticker`**: `id`, `album_id` (FK), `number` (int), `name`, `image` (string/null), `sticker_type` (normal/holográfica/especial).
4. **`UserAlbum`** (Pivote de Seguimiento): `id`, `user_id` (FK), `album_id` (FK), `started_at`.
5. **`UserSticker`** (Inventario del Usuario): `id`, `user_id` (FK), `sticker_id` (FK), `quantity` (int).

---

## 🧠 Reglas de Negocio Clave

### 1. Seguridad IDOR (Insecure Direct Object Reference)
- El backend (`AlbumsService` y `StickersService`) verifica que el usuario autenticado sea el `owner` antes de procesar operaciones destructivas (`update` o `delete`).
- El frontend (Astro) intercepta las respuestas en las rutas de creador (`/my-albums/`). Si el `owner.id` no coincide con el ID del token JWT (`sub`), el usuario es expulsado inmediatamente a `/`, impidiendo el renderizado de formularios ajenos.

### 2. Estado del Álbum e Inactivación ("Álbum Fantasma")
- Si el creador marca `is_shared = false` o elimina el álbum (`is_active = false`), el backend restringirá su acceso (HTTP 403 o 404).
- El frontend renderizará una tarjeta de error indicando **"Álbum No Accesible"**, deshabilitando la vista del Libro pero permitiendo la ejecución del endpoint **"Quitar de mi lista"** para limpiar el dashboard del coleccionista.

### 3. Algoritmo del "Libro de Coleccionista" (`/collection/albums/:id/book`)
El servicio `CollectionService` cruza las láminas base con el inventario del usuario para devolver un objeto calculado:
- **Obtenida:** `quantity >= 1` (UI: Borde verde, Opacidad 100%).
- **Faltante:** `quantity == 0` (UI: Fondo gris, Opacidad 50%).
- **Repetidas:** Se calcula iterando el inventario: `cantidad_repetidas = quantity - 1`.

---

## 🌐 Contrato API REST (Endpoints NestJS)

### Autenticación (`/auth`)
- `POST /auth/register` — Registro de usuario.
- `POST /auth/login` — Autenticación y retorno de JWT.

### Gestión de Álbumes - Creador (`/albums`)
- `POST /albums` — Crear un álbum (Soporta `multipart/form-data` para `cover`).
- `GET /albums/my-albums` — Lista de álbumes creados por el usuario logeado.
- `GET /albums/community` — Lista de álbumes públicos (`is_shared = true`).
- `GET /albums/:id` — Trae el detalle del álbum y su `owner`.
- `PUT /albums/:id` — Editar detalles o visibilidad (Soporta `multipart/form-data`).
- `DELETE /albums/:id` — Soft-delete (`is_active = false`).

### Gestión de Láminas - Creador (`/albums/:albumId/stickers`)
- `POST /albums/:albumId/stickers/bulk` — Carga masiva de láminas (Soporta `multipart/form-data`).
- `GET /albums/:albumId/stickers` — Listar láminas base del álbum.
- `GET /albums/:albumId/stickers/:stickerId` — Detalle de una lámina individual.
- `PUT /albums/:albumId/stickers/:stickerId` — Editar detalles y foto de una lámina.
- `DELETE /albums/:albumId/stickers/:stickerId` — Eliminar una lámina del álbum base.

### Exploración y Colección (`/collection`)
- `GET /collection/my-followed` — Lista de álbumes que el usuario colecciona.
- `POST /collection/albums/:id/follow` — Empezar a seguir un álbum.
- `DELETE /collection/albums/:id/unfollow` — Dejar de seguir un álbum (Elimina el progreso).
- `GET /collection/albums/:id/book` — Trae el estado actual del libro.
- `POST /collection/stickers/:id/add` — Suma +1 a la lámina.
- `POST /collection/stickers/:id/remove` — Resta -1 a la lámina o la borra del inventario.

---

## 🖥️ Estructura de Vistas y BFF (Frontend Astro)

Astro maneja la renderización de las páginas (SSR) y posee su propia API interna (BFF - Backend For Frontend) que procesa los envíos de formularios (`FormData`), adjunta la cookie JWT de forma segura y se comunica con NestJS.

### Páginas de Navegación (UI)
- **Generales / Comunidad:**
  - `GET /` — Dashboard principal (Muestra "Mis Colecciones" y "Comunidad").
  - `GET /albums/:id` — Vista pública/previa de un álbum de la comunidad.
- **Coleccionista:**
  - `GET /my-collection/:id` — "El Libro". Interfaz interactiva para marcar láminas.
- **Creador (Panel Administrativo):**
  - `GET /my-albums` — Listado de los álbumes creados por el usuario.
  - `GET /my-albums/new` — Formulario para crear un nuevo álbum.
  - `GET /my-albums/:id` — Vista de administración de un álbum propio.
  - `GET /my-albums/:id/edit` — Formulario para editar un álbum propio.
  - `GET /my-albums/:id/stickers/new` — Formulario interactivo para carga masiva de láminas.
  - `GET /my-albums/:id/stickers/:stickerId/edit` — Formulario para editar una lámina individual.

### Rutas API Internas (BFF de Astro - `/api/*`)
Estas rutas reciben peticiones del navegador, formatean los datos y contactan a NestJS.
- **Álbumes:**
  - `POST /api/albums/create` — Intercepta y envía datos/foto para crear álbum.
  - `POST /api/albums/:id/update` — Intercepta y envía datos/foto para editar álbum.
  - `POST /api/albums/:id/delete` — Invoca el soft-delete del álbum.
- **Láminas:**
  - `POST /api/albums/:id/stickers` — Envía array de láminas e imágenes (Bulk).
  - `POST /api/albums/:id/stickers/:stickerId/update` — Actualiza una lámina individual.
  - `POST /api/albums/:id/stickers/:stickerId/delete` — Elimina una lámina individual.
- **Colección:**
  - `POST /api/collection/:id/follow` — Seguir un álbum.
  - `POST /api/collection/:id/unfollow` — Dejar de seguir / Quitar álbum fantasma.
  - `POST /api/collection/stickers/:id/add` — Incrementa inventario (Devuelve JSON, no redirige).
  - `POST /api/collection/stickers/:id/remove` — Disminuye inventario (Devuelve JSON, no redirige).