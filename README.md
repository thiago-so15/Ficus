# Ficus

```
███████╗██╗ ██████╗ ██╗   ██╗███████╗
██╔════╝██║██╔════╝ ██║   ██║██╔════╝
█████╗  ██║██║     ██║   ██║███████╗
██╔══╝  ██║██║     ██║   ██║╚════██║
██║     ██║╚██████╗╚██████╔╝███████║
╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝
```

**App mobile-first para coleccionistas de álbumes de figuritas**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![localStorage](https://img.shields.io/badge/localStorage-Web_Storage-333333)](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)

## Qué es Ficus

Ficus es una aplicación web pensada primero para móvil que ayuda a **coleccionistas de álbumes de figuritas** a llevar el control de su colección: qué pegatinas ya tienen, cuáles están duplicadas y cuáles faltan. Centraliza el seguimiento por álbum, la búsqueda y la exploración de tiendas, sin depender de un servidor: **tus datos viven en el dispositivo**, de forma simple y privada.

## Funcionalidades

- Seguimiento de figuritas con tres estados: conseguida, duplicada y falta
- Barra de progreso y estadísticas por álbum
- Modo de escaneo rápido por rango de figuritas
- Buscador global por nombre de álbum o número de figurita
- Mapa de tiendas con búsqueda y filtros
- Detalle de tienda con horarios, mapa y reseñas
- Hoja imprimible de figuritas
- Perfil de coleccionista con logros y estadísticas
- Pantalla de ajustes con tema, notificaciones e idioma
- Onboarding de bienvenida para nuevos usuarios
- Todo guardado localmente en localStorage, sin backend ni login

## Capturas de pantalla

**Próximamente**

## Cómo correr el proyecto localmente

1. Cloná el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd Ficus
   ```

2. Instalá las dependencias:

   ```bash
   npm install
   ```

3. Iniciá el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abrí la URL que muestra Vite en la terminal (por defecto suele ser `http://localhost:5173`).

Para generar una build de producción: `npm run build`. Para previsualizarla: `npm run preview`.

## Estructura del proyecto

```
ficus/
├── public/                 # Activos estáticos servidos tal cual (favicon, SVG, iconos)
├── src/
│   ├── components/         # Piezas reutilizables de UI (navegación, tarjetas, barras, etc.)
│   ├── data/               # Catálogos, claves de almacenamiento y lógica de persistencia (localStorage)
│   ├── screens/            # Pantallas completas de la app (inicio, álbum, tiendas, ajustes, etc.)
│   ├── hooks/              # Hooks de React (estado persistente, preferencias, etc.)
│   ├── utils/              # Utilidades (estadísticas, formato, compartir, etc.)
│   ├── constants/          # Constantes compartidas
│   ├── App.jsx             # Raíz de la aplicación y rutas/vistas
│   ├── App.css             # Estilos principales de la app
│   ├── main.jsx            # Punto de entrada de React
│   └── index.css           # Estilos globales base
├── index.html
├── vite.config.js
└── package.json
```

## Stack tecnológico

| Tecnología | Versión | Para qué se usa |
|------------|---------|-----------------|
| React | ^19.2.4 | UI declarativa, pantallas y componentes |
| Vite | ^8.0.4 | Dev server, build y HMR |
| CSS propio | — | Estilos en `App.css`, `index.css` y clases por componente |

## Roadmap

- Backend
- Sistema de canjes
- Widget nativo
- Landing page
- Soporte multidioma

## Licencia

MIT.
