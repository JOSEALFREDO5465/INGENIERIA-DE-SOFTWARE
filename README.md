# Sistema de Control y Gestión Eclesiástica - Iglesia Filadelfia

Este proyecto es una aplicación web full-stack compuesta por un frontend en **React + TypeScript + Tailwind CSS** y un backend completo en **NestJS + TypeORM + MySQL**.

## Configuración de la base de datos

1. Crear la base de datos importando el script SQL:
   - Archivo: `base de datos/IglesiaFiladelfia.sql`
   - Importar en MySQL (phpMyAdmin, MySQL Workbench o CLI):
     ```bash
     mysql -u root -p < "base de datos/IglesiaFiladelfia.sql"
     ```

2. Configurar las variables de entorno en `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=IglesiaFiladelfia
   JWT_SECRET=filadelfia-secret-key
   ```

## Instalar dependencias
npm install

## Iniciar servidor (puerto 3000)
npm run dev

## Credenciales iniciales
- Usuario: `pastor`
- Contraseña: `Pastor2026!`
- Rol: Pastor (acceso completo)
