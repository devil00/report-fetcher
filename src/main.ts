import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Retrieving the application port from the configuration or using the default value of 3000
  const port = configService.get<number>('app.port', 3000); // Defaults to 3000 if not specified

  await app.listen(port);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: ['localhost:9092'] },
      consumer: { groupId: 'report-group' },
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);

  // Logging the application URL to confirm successful startup
  console.log(`This application is running on: ${await app.getUrl()}`)
  // await app.listen(3000);
}
bootstrap();
