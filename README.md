# Sistema de Control y Gestión Eclesiástica - Iglesia Filadelfia

Este proyecto es una aplicación web full-stack compuesta por un frontend en **React + TypeScript + Tailwind CSS** y un backend completo en **NestJS + TypeORM + PostgreSQL (Supabase)**.

## Configuración de la base de datos (Supabase)

1. Crea un proyecto en **https://supabase.com** (gratis).
2. Ve a **Settings > Database > Connection string** y copia las credenciales.
3. Configura las variables de entorno en `.env`:
   ```
   DB_HOST=db.xxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password_de_supabase
   DB_NAME=postgres
   DB_SSL=true
   JWT_SECRET=filadelfia-secret-key-change-in-production
   ```
   
   O usa la URL de conexión completa:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. Las tablas deben existir en Supabase. Ejecuta el script SQL correspondiente en el SQL Editor de Supabase.

## Instalar dependencias
npm install

## Iniciar servidor (puerto 3000)
npm run dev

## Credenciales iniciales
- Usuario: `pastor`
- Contraseña: `Pastor2026!`
- Rol: Pastor (acceso completo)
