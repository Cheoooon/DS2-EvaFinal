# Especificación Técnica y Arquitectura de Dominio

Este documento define la lógica de negocio, el modelo relacional de datos y los contratos API REST acordados para la comunicación entre NestJS y Astro.

---

## 📊 Modelo Entidad-Relación (Base de Datos MySQL)

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
2. **`Album`**: `id`, `owner_id` (FK), `name`, `description`, `cover_image`, `is_shared` (boolean), `is_active` (boolean, borrado lógico), `created_at`.
3. **`Sticker`**: `id`, `album_id` (FK), `number`, `name`, `image_url`, `type` (normal/holográfica/especial).
4. **`UserAlbum`** (Pivote de Seguimiento): `user_id` (FK), `album_id` (FK), `started_at`.
5. **`UserSticker`** (Inventario del Usuario): `id`, `user_id` (FK), `sticker_id` (FK), `quantity` (int).

---

## 🧠 Reglas de Negocio Clave

### 1. Estado del Álbum e Inactivación
- Si el creador marca `is_shared = false` o elimina el álbum (`is_active = false`), los seguidores **mantienen** la relación en `UserAlbum`, pero el backend devolverá el estado `status: "UNAVAILABLE"`.
- El frontend en Astro renderizará la ficha en gris con el aviso **"Álbum no disponible"**, deshabilitando la vista del Libro y habilitando únicamente la opción de **"Dejar de seguir"**.

### 2. Algoritmo del "Libro de Coleccionista" (`/collection/albums/:id/book`)
El backend realiza una consulta calculada basada en el usuario autenticado:
- **Obtenida:** `quantity >= 1` (Estado: Iluminada).
- **Faltante:** `quantity == 0` o registro inexistente en `UserSticker` (Estado: Sombra/Opaca).
- **Repetidas:** `quantity > 1` (Se calcula como `cantidad_repetidas = quantity - 1`).

---

## 🌐 Contrato API REST

### Autenticación (`/api/auth`)
- `POST /api/auth/register` — Registro de usuario.
- `POST /api/auth/login` — Autenticación y retorno de JWT.

### Gestión de Álbumes - Creador (`/api/albums`)
- `POST /api/albums` — Crear un álbum.
- `PUT /api/albums/:id` — Editar detalles o publicar (`is_shared`).
- `DELETE /api/albums/:id` — Soft-delete (`is_active = false`).
- `POST /api/albums/:id/stickers` — Crear lámina (individual o masivo array).

### Exploración y Colección (`/api/collection`)
- `GET /api/collection/community` — Lista de álbumes compartidos por la comunidad.
- `GET /api/collection/my-albums` — Lista de álbumes que el usuario sigue (incluye flag de disponibilidad).
- `POST /api/collection/albums/:id/follow` — Empezar a seguir un álbum.
- `DELETE /api/collection/albums/:id/unfollow` — Dejar de seguir un álbum (elimina `UserAlbum` e inventario personal de ese álbum).
- `GET /api/collection/albums/:id/book` — Datos completos para renderizar la vista interactiva del libro.
- `PATCH /api/collection/stickers/:id/add` — Sumar 1 a la cantidad de la lámina.
- `PATCH /api/collection/stickers/:id/remove` — Restar 1 a la cantidad de la lámina.