import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar timeouts globales para la aplicación
  app.use((req, res, next) => {
    // Aumentar el timeout de la respuesta a 10 minutos
    res.setTimeout(600000, () => {
      console.log('Request ha alcanzado el timeout');
    });
    next();
  });
  
  // Habilitar CORS
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuración para el manejo de archivos
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Configuración global para Multer (manejo de archivos)
  app.use(
    '/files',
    express.raw({
      limit: '50mb',
      type: 'application/zip',
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
