import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  // Gunakan NestExpressApplication untuk akses static files
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Increase payload size limit for large file uploads
  app.use(bodyParser.json({ limit: '10gb' }));
  app.use(bodyParser.urlencoded({ limit: '10gb', extended: true }));

  // Enable CORS for frontend connection - TAMBAHKAN PORT 3002
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002', // TAMBAH INI
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3002', // TAMBAH INI
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Serve static files - UNTUK CUSTOM ICONS
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📁 Static files served from: ${join(__dirname, '..', 'public')}`);
  console.log(`📁 Icons available at: http://localhost:${port}/uploads/icons/`);
}
bootstrap();