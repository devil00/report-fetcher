import { DataSource, Repository , Not} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProviderResult } from './entities/provider.entity'; // Assuming you have a Team entity
import { TenantConnectionService } from '../../../tenant/tenant.datasource.service';
import { randomUUID } from 'crypto';


@Injectable()
export class ReportProviderRepository {
  constructor(private readonly connectionService: TenantConnectionService){
  }


    private async getRepo(tenantId: string): Promise<Repository<ProviderResult>> {
    // Await the dynamic datasource/connection
    const dataSource: DataSource = await this.connectionService.getDataSource(tenantId);
    return dataSource.getRepository(ProviderResult);
  }


    async findAll(tenantId: string): Promise<ProviderResult[]> {
    const repo = await this.getRepo(tenantId); // Await resolver
    return repo.find();
  }

   async create(reportID : number, tenantId: string, name:string): Promise<ProviderResult> {
    const repo = await this.getRepo(tenantId); // Await resolver
     const report = repo.create({
        reportId: reportID,
        provider: name,
     });

    await repo.save(report);
    return report;
  }

  async areAllProvidersDone(reportID : number, tenantId: string): Promise<Boolean> {
    const providerRepo = await this.getRepo(tenantId); // Await resolver
    const remaining = await providerRepo.count({
    where: {
      reportId: reportID,
      status: Not('DONE'),
    },
  });

  return remaining == 0
  }


  // async markProviderDone(id: string, provider: string, data: any) {
  //   const report = this.reports.get(id);
  //   report.providers[provider] = data;
  // }
}
