import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Projects API')
    .setDescription('CRUD API for managing projects')
    .setVersion('1.0')
    .setLicense('UNLICENSED', 'https://github.com/NadiaSuganiaka/Frameworks-pr1')
    .addServer('http://localhost:3000')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .addSecurityRequirements('bearer')
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, openApiDocument, {
    jsonDocumentUrl: 'docs-json',
    yamlDocumentUrl: 'docs-yaml',
  });
  await writeFile(fileURLToPath(new URL('../openapi.json', import.meta.url)), JSON.stringify(openApiDocument, null, 2));
  await app.listen(Number(process.env.PORT ?? 3000));
}
await bootstrap();
