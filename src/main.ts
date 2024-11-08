import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.enableCors({
  //   origin: [
  //     'https://test.xcuts.co.uk',
  //     'https://xcuts.co.uk',
  //     'https://www.google.com',
  //   ],
  // });
  await app.listen(5000);
}
bootstrap();
