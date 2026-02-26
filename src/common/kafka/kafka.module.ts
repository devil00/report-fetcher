// kafka.module.ts
import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {ConfigModule,ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { KAFKA_PRODUCER } from '../kafka/kafka.constants';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: KAFKA_PRODUCER,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          // 👇 Get broker from environment - will be 'kafka:9092' in Docker
          const broker = configService.get('KAFKA_BROKER', 'localhost:9092');
          
          console.log('📡 Connecting to Kafka broker:', broker);

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'nestjs-app',
                brokers: ['kafka:9092'], // 
                retry: {
                  retries: 5,
                  initialRetryTime: 1000,
                },
                connectionTimeout: 10000,
              },
              consumer: {
                 groupId: 'nestjs-consumer',
                allowAutoTopicCreation: true,
                sessionTimeout: 30000,
                rebalanceTimeout: 60000,
              },
              producer: {
                allowAutoTopicCreation: true,
                idempotent: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService], // Export only KafkaService, not ClientsModule
})
export class KafkaModule {}