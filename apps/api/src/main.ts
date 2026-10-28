import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.get<string>('corsOrigin') });
  await app.listen(config.get<number>('port') ?? 3001, '0.0.0.0');
}

bootstrap();
