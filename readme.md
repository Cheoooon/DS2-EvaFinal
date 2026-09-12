# Sticker Collect - Sistema de Gestión e Intercambio de Láminas

Plataforma web estilo "Cromos de Steam" para la gestión, seguimiento y publicación de colecciones de láminas y álbumes de la comunidad. Desarrollada con arquitectura desacoplada: API REST en **NestJS** y frontend en **Astro** (SSR).

## 🛠️ Stack Tecnológico

- **Backend:** NestJS (v10+), TypeScript, TypeORM, **MariaDB**, JWT, Bcrypt, **Multer** (para la gestión local de archivos e imágenes).
- **Frontend:** Astro (v4+) en modo SSR. Rutas API nativas de Astro actuando como **BFF (Backend for Frontend)**. Componentes y scripts en **Vanilla JavaScript** para la interactividad en tiempo real, sin depender de frameworks adicionales.
- **Almacenamiento:** MariaDB para el modelo relacional; sistema de archivos local (`/uploads`) para imágenes de portadas y láminas.

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

## 🚀 Inicio Rápido (Desarrollo Local)

### Prerrequisitos
- Node.js >= 22.x
- Gestor de paquetes `pnpm` (o `npm`)
- Instancia de **MariaDB** en ejecución

### 1. Configurar Backend (NestJS)
```bash
cd backend
pnpm install
# Crear y configurar el archivo .env con las credenciales de MariaDB y la clave JWT
cp .env.example .env
pnpm run start:dev
```

### 2. Configurar Frontend (Astro)
```bash
cd frontend
pnpm install
# Crear el archivo .env y configurar
cp .env.example .env
pnpm run dev
```

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