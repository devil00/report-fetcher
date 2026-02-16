import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
      ClientsModule.register([
        {
          name: 'KAFKA_PRODUCER',
          transport: Transport.KAFKA,
          options: {
            client: { brokers: ['localhost:9092'] },
          },
        },
      ]),
    ],
    exports: [ClientsModule],
  })
  export class KafkaModule {}
  