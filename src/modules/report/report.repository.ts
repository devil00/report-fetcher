import { DataSource, Repository } from 'typeorm';
import { Injectable,NotFoundException ,Inject} from '@nestjs/common';
import { Report, ReportStatus } from './entities/report.entity'; // Assuming you have a Team entity
import { TenantConnectionService } from '../../tenant/tenant.datasource.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ReportRepository {
  constructor(
    @Inject()
    private readonly connectionService: TenantConnectionService
  ){}

    private async getRepo(tenantId: string): Promise<Repository<Report>> {
    // Await the dynamic datasource/connection
    console.log("getRepo.  Report")
    console.log("tenant " + tenantId)
    const dataSource: DataSource = await this.connectionService.getDataSource(tenantId);
    return dataSource.getRepository(Report);
  }

   async create(tenantId: string, userId: number): Promise<Report> {
    const repo = await this.getRepo(tenantId); // Await resolver
    
    console.log("create.  Report repo")
    console.log("tenant " + tenantId)
    console.log("tenant " + userId)
    const report = new Report();
    report.userID = userId;
    report.tenantID = tenantId;
    report.status = ReportStatus.PENDING;


    const savedReport = repo.create(report);

    await repo.save(savedReport);

    return savedReport;
  }

   async findOne(reportID: number, tenantID: string): Promise<Report> {
    const repo = await this.getRepo(tenantID); // Await resolver

    const report = await repo.findOneBy({ id: reportID });
    if (!report) throw new NotFoundException(`Report #${reportID} not found`);
    return report;
  }

  async findByUserAndTenant(userId: number, tenantId: string): Promise<Report | null> {
    const repo = await this.getRepo(tenantId);
    return repo.findOne({
      where: {
        userID: userId,
        tenantID: tenantId,
      },
    });
  }

   async update(reportID: number, tenantID: string, report: Partial<Report>) {
    const repo = await this.getRepo(tenantID); // Await resolver

    await repo.update(reportID, report)
  }
}