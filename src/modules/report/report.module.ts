import { Module ,forwardRef, Request} from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportResolver } from './report.resolver';
import { ReportsKafkaListener } from './report.event.listener';
import { TenantsModule } from '../../tenant/tenants.module';
import { TenantConnectionService } from '../../tenant/tenant.datasource.service';
import { KafkaModule } from '../../common/kafka/kafka.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [ReportResolver, ReportService],
})

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    KafkaModule,
    forwardRef(() => TenantsModule),
  ],
  providers: [
    ReportService,
    {
      provide: 'REPORT_REPOSITORY',
      scope: Scope.REQUEST,
      inject: [REQUEST, TenantConnectionService],
      useFactory: async (req: any, tenantService: TenantConnectionService) => {
        const tenantId = req.user?.tenantId;
        if (!tenantId) throw new ForbiddenException('Tenant not selected');
        const ds = await tenantService.getDataSource(tenantId);
        return ds.getRepository(Report);
      },
    },
    ReportResolver,
    ReportsKafkaListener,
  ],
})
export class ReportModule {}
