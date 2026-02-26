import { ConfigModule, ConfigService } from '@nestjs/config';

// config/bull.config.ts

import { BullRootModuleOptions } from '@nestjs/bullmq';

export const bullQueueConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<BullRootModuleOptions> => {
    const host = configService.get<string>('redis.host', 'redis');
    const port = configService.get<number>('redis.port', 6379);
    const password = configService.get<string>('redis.password', '');
    const db = configService.get<number>('redis.db', 0);
    const useTls = configService.get<boolean>('redis.use_tls', false);

    console.log('🔌 BullMQ Redis Configuration:');
    console.log('   Host:', host);
    console.log('   Port:', port);
    console.log('   DB:', db);
    console.log('   Password:', password ? '****' : 'none');
    console.log('   TLS:', useTls);

    return {
      connection: {
        host,
        port,
        password: password || undefined,
        db,
         connectTimeout: 30000,      // 30 seconds
        commandTimeout: 30000,       // 30 seconds for commands
        keepAlive: 60000,            // 60 seconds
        maxRetriesPerRequest: 3,     // Retry failed commands
        enableReadyCheck: true,
        ...(useTls && { tls: {} }),
        retryStrategy: (times: number) => {
          if (times > 10) {
            console.error('❌ Max Redis retries reached');
            return null;
          }
          const delay = Math.min(times * 1000, 10000);
          console.log(`🔄 Redis retry attempt ${times}, delay: ${delay}ms`);
          return delay;
        },
      },
      defaultJobOptions: {
        attempts: configService.get<number>('QUEUE_DEFAULT_ATTEMPTS', 4),
        backoff: { 
          type: 'exponential', 
          delay: configService.get<number>('QUEUE_BACKOFF_DELAY', 3000) 
        },
        removeOnComplete: { 
          age: configService.get<number>('QUEUE_COMPLETE_AGE', 3600), 
          count: configService.get<number>('QUEUE_COMPLETE_COUNT', 1000) 
        },
        removeOnFail: { 
          age: configService.get<number>('QUEUE_FAIL_AGE', 86400), 
          count: configService.get<number>('QUEUE_FAIL_COUNT', 1000) 
        },
      },
    };
  },
};