import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  // Configure CORS explicitly
  const originsEnv = process.env.CORS_ORIGINS; // e.g. "http://localhost:4200,http://localhost:3001,https://yourdomain.com"
  const originList = originsEnv
    ? originsEnv
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)
    : [];

  app.enableCors({
    origin: originList.length ? originList : true, // true = reflect request origin (development)
    credentials: true, // allow cookies / auth headers when needed
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 3600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
