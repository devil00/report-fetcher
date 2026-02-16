import { Injectable,Inject } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { ReportPollerService } from '../report/tasks/report-poller.service';

@Injectable()
export class ReportsKafkaListener {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
    
        @Inject('KAFKA_PRODUCER')
        private readonly kafkaProducer: ClientKafka,

        @Inject
        private readonly pollerService: ReportPollerService
      ) {}

      
  @EventPattern('report.created')
  async handleReportCreated(@Payload() payload: any, @Ctx() context: KafkaContext) {
    console.log('Received report.created event', payload);
    // Do something: store in analytics DB, notify user, etc.
    await this.pollerService.processReports(payload);


  }
}