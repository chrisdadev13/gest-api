import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200', 'https://gest-client.vercel.app'],
    allowedHeaders: '*',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
