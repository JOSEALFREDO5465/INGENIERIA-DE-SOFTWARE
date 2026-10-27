import 'reflect-metadata';
import * as dotenv from 'dotenv';

// Load environment variables from .env before importing application modules
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Expose API suffix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors();

  const expressInstance = app.getHttpAdapter().getInstance();

    if (process.env.NODE_ENV !== 'production') {
    console.log('--- Development Mode: Mounting Vite Dev Middleware... ---');
    // Dynamically require Vite server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Ensure API routes are handled by Nest; let Vite handle only non-/api requests
    expressInstance.use((req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/api')) return next();
      return vite.middlewares(req, res, next);
    });
  } else {
    console.log('--- Production Mode: Serving static files from dist/ ---');
    const distPath = path.join(process.cwd(), 'dist');
    expressInstance.use(express.static(distPath));
    // Compatible con Express 5: capturar cualquier ruta no API y servir el SPA
    expressInstance.use((req: any, res: any) => {
      if (req.url && req.url.startsWith('/api')) {
        return res.status(404).json({ message: 'Ruta API no encontrada' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = 3000;
  await app.listen(port, 'localhost', () => {
    console.log(`--- Server running dynamically at http://localhost:${port} ---`);
  });
}

bootstrap();
