import { Module ,forwardRef, Request, Scope,ForbiddenException} from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { ReportResolver } from './report.resolver';
import { ReportProcessor } from './report.processor';
import { ReportsKafkaListener } from './report.event.listener';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueueModule } from '../../common/bullmq/queue.module';
import { Report } from '../report/entities/report.entity';
import { ProviderResult } from '../report/providers/entities/provider.entity';
import { ReportProviderRepository } from '../report/providers/provider.repo';
import { GraphqlPubsubModule } from '../../common/pubsub/graphql.pubsub.module';
import { ReportProvider } from './providers/provider.service';
import { TenantsModule } from '../../tenant/tenants.module';

import { AuthModule } from '../../auth/auth.module';
import { KafkaModule } from 'src/common/kafka/kafka.module';


@Module({
  imports: [
  // TypeOrmModule.forFeature([]),
  TypeOrmModule.forFeature([Report, ProviderResult]),
   TenantsModule,
    QueueModule,              // QueueService should be exported from here
    GraphqlPubsubModule,
    AuthModule,
    KafkaModule,
  ],
  providers: [
    ReportService,
    ReportResolver,
    ReportProcessor,
    ReportRepository,
    ReportProviderRepository,
    ReportProvider,
  ],
  exports: [
    ReportService,
  ],
  controllers: [ReportsKafkaListener]
})
export class ReportModule {}