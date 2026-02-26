import { Injectable,Inject,Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QueueService } from '../../common/bullmq/queue-service';

import { ReportService } from './report.service';
import { Report } from './entities/report.entity';
// import { KAFKA_PRODUCER } from '../../common/kafka/kafka.module';

@Controller()
export class ReportsKafkaListener {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,


        @Inject()
         private readonly queueService: QueueService,

        @Inject()
        private reportService: ReportService,
      ) {}

      
  @EventPattern('report.create')
  async handleReportCreated(@Payload() payload: any, @Ctx() context: KafkaContext) {
    console.log('Received report.create event', payload);
    // Do something: store in analytics DB, notify user, etc.

    this.queueService.addGenerateReportJob({
      userId: payload.userId,
      tenantId: payload.tenantID,
      reportID: payload.reportID,
      name: payload.reportName,
    })

  }

  @EventPattern('report.ready')
  async handleReportReady(@Payload() payload: any, @Ctx() context: KafkaContext) {
    console.log('Received report.ready event', payload);
    // Do something: store in analytics DB, notify user, etc.

    this.reportService.notifyReportReady(payload.reportID);

  }
}