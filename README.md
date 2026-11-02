# FlatMatch Backoffice

Backoffice administrativo de FlatMatch para gestionar solicitudes de validación
de publicadores de inmuebles.

> **Estado actual:** el proyecto tiene una estructura inicial por funcionalidades.
> Las vistas y componentes todavía son placeholders; la interfaz y la lógica se
> implementarán progresivamente, vista por vista.

## Requisitos

- Node.js compatible con la versión de Vite instalada.
- npm.

## Instalación y ejecución

Desde la raíz del proyecto:

```bash
npm install
npm run dev
```

Vite muestra en la terminal la URL local para abrir en el navegador (por defecto,
`http://localhost:5173`).

Para detener el servidor, usa `Ctrl+C` en la terminal.

## Comandos disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run lint     # Ejecuta ESLint
npm run build    # Verifica TypeScript y genera la versión de producción
npm run preview  # Sirve localmente la última compilación
```

Para revisar la compilación localmente:

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```text
public/
├── favicon.svg                 # Favicon de FlatMatch
└── images/                     # Imágenes servidas directamente como estáticas

src/
├── assets/
│   ├── icons/                  # Iconos importados desde la aplicación
│   ├── images/                 # Imágenes importadas desde la aplicación
│   └── prototype/              # Capturas de referencia del prototipo
├── components/
│   ├── feedback/               # Estados vacíos y mensajes de error compartidos
│   ├── tables/                 # Componentes reutilizables para tablas
│   └── ui/                     # Elementos de interfaz compartidos
├── config/
│   └── theme.ts                # Paleta de colores del backoffice
├── features/
│   ├── auth/                   # Inicio de sesión y autenticación
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── publisher-validation/   # Gestión de solicitudes de publicadores
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
├── hooks/                      # Hooks compartidos entre funcionalidades
├── layouts/                    # Estructuras visuales compartidas por páginas
├── routes/                     # Definición y protección de rutas
├── services/                   # Servicios compartidos, como el cliente API
├── types/                      # Tipos compartidos
├── App.tsx                     # Componente raíz de la aplicación
├── index.css                   # Estilos globales y variables CSS
└── main.tsx                    # Punto de entrada de React
```

### Organización por funcionalidades

Cada carpeta dentro de `features/` agrupa lo relacionado con una funcionalidad:

- `pages/`: vistas completas asociadas a rutas.
- `components/`: componentes específicos de esa funcionalidad.
- `hooks/`: lógica reutilizable de React propia de la funcionalidad.
- `services/`: comunicación con APIs u otros servicios.
- `types/`: tipos de TypeScript propios de la funcionalidad.
- `utils/`: funciones auxiliares propias de la funcionalidad, cuando se necesitan.

Los componentes que puedan reutilizarse en varias funcionalidades se ubican en
`src/components/`. Los layouts, rutas y servicios compartidos se mantienen en sus
carpetas correspondientes dentro de `src/`.

## Rutas actuales

Las rutas están declaradas en `src/routes/AppRouter.tsx`:

| Ruta | Vista |
| --- | --- |
| `/login` | Inicio de sesión |
| `/requests` | Listado de solicitudes |
| `/requests/:id` | Detalle de una solicitud |
| `/requests/:id/history` | Historial de una solicitud |

Las rutas y páginas son parte del esqueleto inicial: su declaración no implica
que la autenticación, la protección de acceso ni las vistas estén implementadas.

## Alias de imports

El alias `@` apunta a `src/`. Se puede usar para evitar rutas relativas largas:

```tsx
import Button from '@/components/ui/Button'
import LoginPage from '@/features/auth/pages/LoginPage'
```

El alias está configurado tanto en Vite como en TypeScript.

## Guía para desarrollar una vista

1. Identifica la funcionalidad correspondiente dentro de `src/features/`.
2. Crea o actualiza la página en su carpeta `pages/`.
3. Divide la vista en componentes propios de la funcionalidad si hace falta.
   Si un componente es compartido, ubícalo en `src/components/`.
4. Añade o actualiza la ruta en `src/routes/AppRouter.tsx`.
5. Mantén las llamadas a servicios, tipos y hooks en sus carpetas respectivas.
6. Usa los colores de `src/config/theme.ts` y conserva las capturas del prototipo
   como referencia en `src/assets/prototype/`.
7. Antes de finalizar, ejecuta:

   ```bash
   npm run lint
   npm run build
   ```

## Paleta de colores

| Token | Color |
| --- | --- |
| `primary` | `#F07218` |
| `secondary` | `#106814` |
| `error` | `#FF0000` |
| `success` | `#00FF00` |
| `info` | `#F07218` |
