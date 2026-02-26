import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService,ConfigModule } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

export const REDIS_PUBSUB = 'REDIS_PUBSUB';

export const pubSubProvider: Provider = {
  provide: PUB_SUB,
  useValue: new PubSub(),
};

export const RedisPubSubProvider: Provider = {
  provide: REDIS_PUBSUB,
  inject: [ConfigService],  // 👈 Important: Add this!
  useFactory: (configService: ConfigService) => {
    console.log('🔌 Connecting to Redis:', configService.get<string>('redis.host'));
    // Fix the typo: 'redit.port' -> 'redis.port'
    const host = configService.get<string>('redis.host') || 'localhost';
    const port = configService.get<number>('redis.port') || 6379;  // Fixed typo
    const password = configService.get<string>('redis.password') || '';

    console.log('🔌 Connecting to Redis:', { host, port, password: password ? '***' : undefined });

    const options = {
      host,
      port: Number(port) || 6379,  // Ensure it's a number with fallback
      password: password || undefined,
      retryStrategy: (times: number) => {
        return Math.min(times * 50, 2000);
      },
    };

    return new RedisPubSub({
      publisher: new Redis(options),
      subscriber: new Redis(options),
    });
  },
};

@Global() // Make it global if used everywhere
@Module({
  imports: [
    ConfigModule, // 👈 Important: Import ConfigModule
  ],
  providers: [RedisPubSubProvider],
  exports: [RedisPubSubProvider],
})
export class GraphqlPubsubModule {}