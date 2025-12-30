import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '10gb' }));
  app.use(bodyParser.urlencoded({ limit: '10gb', extended: true }));

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002', 
      'http://127.0.0.1:3002', 
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
  
  console.log(` Application is running on: http://localhost:${port}`);
  console.log(` Static files served from: ${join(__dirname, '..', 'public')}`);
  console.log(` Icons available at: http://localhost:${port}/uploads/icons/`);
}
bootstrap();