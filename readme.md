# Sticker Collect - Sistema de Gestión e Intercambio de Láminas

Plataforma web estilo "Cromos de Steam" para la gestión, seguimiento y publicación de colecciones de láminas y álbumes de la comunidad. Desarrollada con arquitectura desacoplada: API REST en **NestJS** y frontend en **Astro**.

## 🛠️ Stack Tecnológico

- **Backend:** NestJS (v10+), TypeScript, TypeORM, MySQL 8.x, Passport JWT, Bcrypt.
- **Frontend:** Astro (v4+), SSR Mode, Tailwind CSS, Componentes React/Vue para la interactividad del "Libro".
- **Almacenamiento:** MySQL para datos relacionales; almacenamiento local/S3 para imágenes de láminas.

## 📂 Estructura del Proyecto

```text
stickers-platform/
├── backend/            # API REST en NestJS (Módulos: Auth, Albums, Stickers, Collection)
├── frontend/           # Aplicación Web en Astro (Vistas SSR y Componentes Interactivos)
├── ARCHITECTURE.md     # Especificaciones técnicas, modelo DB y contrato de API
└── README.md           # Guía general de instalación y arranque
```

## 🚀 Inicio Rápido (Desarrollo Local)

### Prerrequisitos
- Node.js >= 18.x
- Instancia de MySQL en ejecución (`album_db`)

### 1. Configurar Backend (NestJS)
```bash
cd backend
npm install
cp .env.example .env
# Configurar credenciales DB en .env
npm run start:dev
```

### 2. Configurar Frontend (Astro)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔒 Roles y Permisos Principales

- **Creador (Owner):** Usuario autenticado que crea un álbum. Posee control total sobre la edición, borrado y adición/modificación de sus láminas. Puede cambiar la visibilidad a `Pública` (Compartida).
- **Coleccionista (Follower):** Usuario autenticado que decide "seguir" un álbum público. Mantiene su propio inventario relacional (obtenidas, repetidas, faltantes) sin alterar la estructura original del álbum.