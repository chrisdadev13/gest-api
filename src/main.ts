import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PartialGraphHost } from '@nestjs/core';

import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    abortOnError: false,
  });
  await app.listen(3000);
}

bootstrap().catch((err) => {
  writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  console.error(err);
  process.exit(1);
});
