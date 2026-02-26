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


      onModuleInit() {
        console.log('✅ ReportsKafkaListener registered');
        // Log the container's environment to see which group might be used
        console.log('KAFKA_GROUP_ID env:', process.env.KAFKA_GROUP_ID);
      }

  @EventPattern('report.create')
  async handleReportCreated(@Payload() payload: any, @Ctx() context: KafkaContext) {
    console.log('Received report.create event', payload);
    // Do something: store in analytics DB, notify user, etc.

    this.queueService.addGenerateReportJob({
      userId: payload.userId,
      tenantId: payload.tenantId,
      reportID: payload.reportId,
      name: payload.metadata.name,
    })

  }

  @EventPattern('report.ready')
  async handleReportReady(@Payload() payload: any, @Ctx() context: KafkaContext) {
    console.log('Received report.ready event', payload);

    console.log('📨 Received report.ready event:', payload);
  
  // Log the full payload to see what's coming
  console.log('Full payload:', JSON.stringify(payload, null, 2));
  
  // Access fields using the correct property names
  const reportId = payload.reportId; // 👈 Use camelCase to match emitter
  const tenantId = payload.tenantId;  // 👈 Use camelCase to match emitter
  const fileUrl = payload.fileUrl;
  const userId = payload.userId;
  const format = payload.format;
  
  console.log(`📊 Processing report ${reportId} for tenant ${tenantId}`);
  console.log(`📎 File URL: ${fileUrl}`);
  console.log(`👤 User ID: ${userId}`);
  
  // Call service with correct parameters
  await this.reportService.notifyReportReady(reportId, tenantId);
    // Do something: store in analytics DB, notify user, etc.
  }
}