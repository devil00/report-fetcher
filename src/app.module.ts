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
      context: ({ req,connection }) => {
        // Log to debug
        console.log('📨 GraphQL Context - Headers:', req.headers.authorization);
        console.log('📨 GraphQL Context - User:', req.user);
        console.log('📨 GraphQL connection - :',connection);
        
        // HTTP request
        if (req) {
          console.log('📨 HTTP Request - Headers auth:', req.headers.authorization ? 'Present' : 'Missing');
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
        
        return { req: { headers: {}, user: null } };
      },
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            console.log('🔌 WebSocket connection attempt');
            
            // Extract token from connection params
            const connectionParams = context.connectionParams || {};
            const authToken = connectionParams.Authorization || 
                             connectionParams.authorization || 
                             connectionParams.token;
            
            console.log('🔑 WebSocket token present:', !!authToken);
            
            // Return context that will be available in resolvers
            return {
              req: {
                headers: {
                  authorization: authToken,
                },
                user: null, // Will be populated by auth guard
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