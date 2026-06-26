import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { PrismaClientExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  // Validate critical environment variables
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET environment variable is not defined. Server starting with fallback.');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('FATAL ERROR: DATABASE_URL environment variable is not defined.');
  }

  const app = await NestFactory.create(AppModule);

  // Bind the Prisma exception filter globally
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static files from the uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Enable CORS with credentials for cookies
  app.enableCors({
    origin: ['http://localhost:5173'], // frontend Vite port
    credentials: true,
  });

  // Enable cookie parsing
  app.use(cookieParser());

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable global validation DTO mapping
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
