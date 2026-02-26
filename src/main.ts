import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService, } from '@nestjs/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DataSource } from "typeorm";


import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bullmq';
import Redis from 'ioredis';

import { QueueNames } from './common/bullmq/queue.constants';
import { KafkaHealthCheck } from './common/kafka/kafka.health';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

   // CRITICAL: Wait for all modules to be fully initialized
  await app.init();
  

  // Retrieving the application port from the configuration or using the default value of 3000
  const port = configService.get<number>('app.port', 3000); // Defaults to 3000 if not specified

  // await app.listen(port);

  // Wait for Kafka to be healthy
  const healthCheck = new KafkaHealthCheck(configService);
  await healthCheck.waitForKafka();
  await waitForRedis();

  // app.connectMicroservice({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: { brokers: ['kafka:9092'] },
  //     consumer: { groupId: 'report-group' },
  //   },
  // });
  // await app.startAllMicroservices();

  const broker = configService.get('KAFKA_BROKER', 'kafka:9092');
  
  // ✅ Connect Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'],
        clientId: 'nestjs-consumer',
        retry: {
          retries: 10,
          initialRetryTime: 1000,
          maxRetryTime: 30000,
        },
      },
      consumer: {
        groupId: 'nestjs-group-client',
        allowAutoTopicCreation: true,
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        retry: {
          retries: 5,
        },
      },
      
      // ✅ Use type assertion to bypass the error
      subscribe: {
        topics: ['report.create', 'report.ready'],
        fromBeginning: true,
      } as any, // Temporary workaround
    },
  });
  
  // Start all m

  // Start all microservices
  await app.startAllMicroservices();
  

   const dataSource = app.get(DataSource);
  console.log('📊 Registered entities:', 
    dataSource.entityMetadatas.map(e => e.name)
  );


  await app.listen(3000);



  //   try {
  //   // Get queues from Nest DI after initialization
  //   const reportQueue = app.get(getQueueToken(QueueNames.REPORT));
  //   const dlqQueue = app.get(getQueueToken(QueueNames.APPOINTMENT_DLQ));

  //   const serverAdapter = new ExpressAdapter();
  //   serverAdapter.setBasePath('/bull-board');

  //   // Create bull MQ dashboard
  //   createBullBoard({
  //     queues: [new BullMQAdapter(reportQueue), new BullMQAdapter(dlqQueue)],
  //     serverAdapter,
  //   });

  //   app.use('/bull-board', serverAdapter.getRouter());
  //   console.log('📊 Bull Board mounted at /bull-board');
  // } catch (error) {
  //   console.error('Failed to initialize Bull Board:', error.message);
  // }
  // Logging the application URL to confirm successful startup
  console.log(`This application is running on: ${await app.getUrl()}`)
  //  console.log(`Bull Board: http://localhost:${port}/bull-board`);
  // await app.listen(3000);
}

async function waitForRedis(maxRetries = 10, delay = 1000) {
  const Redis = require('ioredis');
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    connectTimeout: 2000,
    retryStrategy: null,
  });

  for (let i = 0; i < maxRetries; i++) {
    try {
      await redis.ping();
      console.log(`✅ Redis ready after ${i + 1} attempts`);
      await redis.quit();
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for Redis (${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('❌ Redis not ready after maximum retries');
  process.exit(1);
}
bootstrap();
