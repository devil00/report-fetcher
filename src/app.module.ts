import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from "@nestjs/graphql";
import { DatabaseConfigService } from './config/config.service';
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { UsersModule } from './user/users.module';
import { TenantsModule } from './tenant/tenants.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { GqlJwtAuthGuard } from './auth/guards/gql-auth.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportModule } from './modules/report/report.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [MyConfigModule, TenantsModule,
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
      inject: [DatabaseConfigService]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      context: ({ req }) => ({ req, tenantID: req.tenant?.id, }),
    }),
    UsersModule,
    AuthModule,
    KafkaModule,
    ScheduleModule.forRoot(),
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService, {provide: APP_GUARD, useClass: GqlJwtAuthGuard}],
})
export class AppModule {}
