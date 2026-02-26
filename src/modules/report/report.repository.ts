import { DataSource, Repository } from 'typeorm';
import { Injectable,NotFoundException } from '@nestjs/common';
import { Report, ReportStatus } from './entities/report.entity'; // Assuming you have a Team entity
import { TenantConnectionService } from '../../tenant/tenant.datasource.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ReportRepository {
  constructor(private readonly connectionService: TenantConnectionService){}

    private async getRepo(tenantId: string): Promise<Repository<Report>> {
    // Await the dynamic datasource/connection
    console.log("getRepo.  Report")
    console.log("tenant " + tenantId)
    const dataSource: DataSource = await this.connectionService.getDataSource(tenantId);
    return dataSource.getRepository(Report);
  }

   async create(tenantId: string, userId: number): Promise<Report> {
    const repo = await this.getRepo(tenantId); // Await resolver

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

   async update(reportID: number, tenantID: string, report: Partial<Report>) {
    const repo = await this.getRepo(tenantID); // Await resolver

    await repo.update(reportID, report)
  }
}