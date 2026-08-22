import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3001;

  const config = new DocumentBuilder()
    .setTitle('Oteems API')
    .setDescription('API documentation for the Oteems application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  console.log(`The server is running on http://localhost:${port}`);
  console.log(`The api docs is running on http://localhost:${port}/docs`);
}
bootstrap();
