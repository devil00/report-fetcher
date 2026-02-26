import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from "@nestjs/graphql";
import { DatabaseConfigService } from './config/database.config';
import { bullQueueConfig } from './config/bull.config';
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { UsersModule } from './user/users.module';
import { TenantsModule } from './tenant/tenants.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { GqlJwtAuthGuard } from './auth/guards/gql-auth.guard';
import { ReportModule } from './modules/report/report.module';
import { JwtService } from '@nestjs/jwt';
// import { KafkaModule } from './common/kafka/kafka.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './common/bullmq/queue.module';
@Module({
  imports: [
    MyConfigModule,
    // BullMQ root configuration
    BullModule.forRootAsync(bullQueueConfig),
    
    //  userId: payload.userID,
    //   username: payload.username,
    //   tenantId: payload.tenantId,
    // Your other modules
    TenantsModule,
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
      inject: [DatabaseConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      context: ({ req, connection }) => {
        
        // HTTP request
        if (req) {
          console.log('📨 HTTP Request - Headers auth:', req.headers.authorization ? 'Present' : 'Missing');
          console.log('📨 HTTP Request - User:', req.user);
          return { req };
        }
        
        // WebSocket connection
        if (connection) {
          console.log('🔌 WebSocket connection context:', connection.context);
          return {
            req: connection.context?.req || { 
              headers: {}, 
              user: null 
            },
          };
        }
        
        console.log('⚠️ No request or connection found');
        return { req: { headers: {}, user: null } };
      },
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
          onConnect: (context: any) => {
            console.log('🔌 WebSocket connection attempt');
            
            const connectionParams = context.connectionParams || {};
            const authToken = connectionParams.Authorization || 
                             connectionParams.authorization || 
                             connectionParams.token;
            
            console.log('🔑 WebSocket token present:', !!authToken);
            
            return {
              req: {
                headers: {
                  authorization: authToken,
                },
                user: null,
              },
            };
          },
        },
      },
    }),
    UsersModule,
    AuthModule,
    // QueueModule, // This registers the actual queues,
    ReportModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: GqlJwtAuthGuard },
  ],
})
export class AppModule {}