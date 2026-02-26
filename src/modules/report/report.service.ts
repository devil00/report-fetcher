import { Injectable, Inject,forwardRef } from '@nestjs/common';
import { CreateReportInput } from './dto/create-report.input';
import { ReportResponse } from './dto/report-status-response';
import { UpdateReportInput } from './dto/update-report.input';
import { In, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportProviderRepository } from './providers/provider.repo';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportRepository } from './report.repository';
import { ReportStatus } from './dto/report';
// import { KAFKA_PRODUCER } from '../../common/kafka/kafka.module';
// import { KafkaService} from '../../common/kafka/kafka.service';
import { REDIS_PUBSUB } from '../../common/pubsub/graphql.pubsub.module';
import { PubSub } from 'graphql-subscriptions';


@Injectable()
export class ReportService {
  constructor(
    // @InjectRepository(Report)
    @Inject()
    private readonly reportRepo: ReportRepository,

    //  @InjectRepository(ReportProviderRepository)
     @Inject()
    private readonly reporProviderRepo: ReportProviderRepository,

    // @Inject()
    // private readonly kafkaService: KafkaService,

     @Inject(REDIS_PUBSUB) private readonly pubSub: PubSub,
  ) {}

  create(createReportInput: CreateReportInput) {
    return 'This action adds a new report';
  }

  async findOne(id: number, tenantId: string): Promise<Report> {
    return await this.reportRepo.findOne(id, tenantId)
  }

  async findStatus(id: number, userId: number, tenantId: string): Promise<string> {
    const report = await this.findOne(id, tenantId)

    return report.status
  }

    async findUrl(id: number, userId: number, tenantId: string): Promise<string> {
    const report = await this.findOne(id, tenantId)

    return report.fileUrl || ""
  }

  update(id: number, updateReportInput: UpdateReportInput) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }

  findAll(id: number) {
    return `This action returns a #${id} report`;
  }


  async createReport(userId: number, tenantId: string): Promise<ReportResponse> {
    const saved = await this.reportRepo.create(tenantId, userId);

    if (saved.id > 0) {
      // this.kafkaService.emitReportCreated({
      //   reportId: saved.id,
      //   tenantId: saved.tenantID,
      //   createdBy: "report-service",
      //   userId: saved.userID,
      //   timestamp: new Date(),
      //   metadata: {"name": "Test report"},
      // })

      // this.kafkaProducer.emit('report.create', {
      //       reportId: saved.id,
      //       tenantId: tenantId,
      //       userId: userId,
      //       timestamp: new Date(),
      //     });
      
        return  {
          status: 'in_progress',
          reportID: saved.id,
          progress: saved.progress,
          // report: saved, // Returning the actual database entity
        }
    }


    return {
       status: 'FAILED',
    };
  }

   async notifyReportReady(reportId: string) {
    await this.pubSub.publish('reportReady', {
      reportReady: reportId,
    });
  }

  async markCompleted(
    reportId: number,
    tenantId: string,
    fileUrl: string,
  ) {
   const report = await this.reportRepo.findOne(reportId, tenantId);
    report.status = ReportStatus.COMPLETED;
    report.fileUrl = fileUrl;

    await this.reportRepo.update(reportId, tenantId, report);
  }

  async findById(reportId: number, tenantId: string) {
    return  this.findOne(reportId, tenantId)
  }

}
