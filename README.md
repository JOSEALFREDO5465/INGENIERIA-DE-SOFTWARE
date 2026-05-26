# Sistema de Control y Gestión Eclesiástica - Iglesia Filadelfia

Este proyecto es una aplicación web full-stack compuesta por un frontend en **React + TypeScript + Tailwind CSS** y un backend completo en **NestJS + TypeORM + MySQL**.

# Estructura de Carpetas

La aplicación está organizada bajo los estándares modulares de NestJS e integra el frontend y backend de manera óptima para el despliegue:

Filadelfia/
│
├── src/                         # Frontend React + TS (Sincronizado vía Contexto con API REST)
│   ├── componentes/             # Componentes reutilizables de UI
│   ├── paginas/                 # Pestañas operativas (Miembros, Actividades, Grupos, Usuarios, etc.)
│   ├── contextos/               # Contexto Global (AppContexto.tsx realiza llamadas a endpoints)
│   ├── tipos/                   # Tipos TypeScript compartidos (Usuario, Miembro, etc.)
│   ├── App.tsx                  # Enrutador estructural
│   └── main.tsx                 # Entrada react
│
├── backend/                     # Backend Modular NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # Módulo de Autenticación y Control de Sesión
│   │   │   ├── users/           # Módulo de Gestión de Usuarios y Solicitudes
│   │   │   ├── ministries/      # Módulo CRUD de Ministerios
│   │   │   ├── members/         # Módulo CRUD de Miembros con Campos Demográficos directos
│   │   │   ├── groups/          # Módulo CRUD de Grupos de Crecimiento (Jóvenes / Mayores)
│   │   │   ├── activities/      # Módulo CRUD de Actividades y su Meta/Lugar/Responsable
│   │   │   ├── inventory/       # Módulo CRUD de Artículos del Inventario
│   │   │   └── dashboard/       # API de Resumen Estadístico y Consolidados
│   │   │
│   │   ├── database.config.ts   # Conexión dinámica (MySQL / Fallback a SQLite)
│   │   ├── app.module.ts        # Módulo raíz de NestJS
│   │   └── main.ts              # Inicializador y servidor con Vite Middleware
│   │
│   └── tsconfig.json            # Configuración de compilador para NestJS Decorators
│
├── docker-compose.yml           # Configuración de orquestación local (MySQL + App Node)
└── README.md                    # Documentación
```

## Características de Seguridad y Base de Datos

1. **Protección de Navegación**: Se restringe por completo la carga de tableros privados o módulos internos si el `usuarioActual` no está autenticado en sesión, redirigiendo de manera segura a la interfaz de inicio de sesión.
2. **Encriptación de Contraseñas**: Todas las contraseñas se almacenan encriptadas en la base de datos utilizando hashes generados por `bcryptjs` con 10 rondas de salt.
3. **Usuario Administrador por Defecto**: El sistema se autofinancia con un usuario administrador principal en su primer arrranque en caso de base de datos vacía:
   - **Usuario**: `Tito`
   - **Contraseña**: `1234`
4. **Base de Datos Configurable**: La conexión a MySQL se configura de manera flexible a través del archivo `.env`. Si no se proveen credenciales válidas, el sistema utiliza un fallback automático a una base de datos local SQLite (`database.sqlite`) para garantizar la ejecución fluida en entornos de desarrollo.

## Configuración y Despliegue

### Variables de Entorno (.env)

Configura los siguientes valores en tu archivo `.env` en la raíz del proyecto para conectar tu base de datos MySQL preferida:

```env
# Datos de conexión MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tito
DB_PASSWORD=password123
DB_DATABASE=filadelfia_db
```

### Ejecutar en Desarrollo

Puedes arrancar la aplicación completa y su base de datos localmente utilizando docker-compose:

```bash
docker-compose up --build
```

O arrancar de manera manual el servidor de desarrollo NodeJS:

```bash
# Instalar dependencias
npm install

# Iniciar servidor unificado (NestJS on Port 3000 con Vite en tiempo real)
npm run dev
```
