import { Injectable, Inject ,Logger, forwardRef} from '@nestjs/common';
import { CreateReportInput } from './dto/create-report.input';
import { UpdateReportInput } from './dto/update-report.input';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { KafkaService } from '../../common/kafka/kafka.service';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { ReportProviderRepository } from './providers/provider.repo';
import { ReportProvider } from './providers/provider.service';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNames } from 'src/common/bullmq/queue.constants';

const MAX_POLL_ATTEMPTS = 10;        // 10 polls × 10s = 100s
const MAX_CYCLE_ATTEMPTS = 3;        // full restart limit
const POLL_DELAY = 10000;            // 10 seconds
const COOLDOWN_DELAY = 60000;  


@Processor(QueueNames.REPORT)
@Injectable()
export class ReportProcessor extends WorkerHost {
     private readonly logger = new Logger(ReportProcessor.name);
  
  constructor(
    private readonly reportService: ReportService,
    private readonly providerService: ReportProvider,
    
    @Inject() // Not needed, but can be explicit
    private readonly reportRepo: ReportRepository,

    @Inject()
    private readonly reporProviderRepo: ReportProviderRepository,

    @Inject()
    private providerA: ReportProvider,
    // @Inject()
    // private resolver: ReportResolver,

    @Inject()
    private readonly kafkaService: KafkaService,
  ) {
    super();
  }

  // This replaces the async (job: Job) => { ... } logic
  async process(job: Job<any, any, string>): Promise<any> {
    // Your logic goes here
    // e.g., await this.reportService.doSomething(job.data);
    // data: { userId: string; tenantId: string; reportID:number,name: string 

    this.logger.log(`Processing job ${job.id} for ${job.data.email}`);
    await job.updateProgress(10);

     const { userId, tenantId, reportID, name } = job.data;

        // await this.reportRepo.update(reportId, tenantId, {
        //   status: 'PROCESSING',
        //   progress: 10,
        // });

        await this.reportRepo.update(reportID, tenantId, { ['status']: 'processing', 'progress': 10 });

        // Fetch providers in parallel
        // const [a, b, c] = await Promise.all([
        //   this.providerA.fetch(),
        //   this.providerB.fetch(),
        //   this.providerC.fetch(),
        // ]);

         const [a, b, c] = await Promise.all([
          this.providerA.fetch({ ...job.data, provider: 'A' }),
          this.providerA.fetch({ ...job.data, provider: 'B' }),
          this.providerA.fetch({ ...job.data, provider: 'C' }),
        ]);

        const aggregated = {
          ...a,
          ...b,
          ...c,
        };

        // Simulate PDF generation
        await new Promise(r => setTimeout(r, 2000));

        const fileUrl =
          `https://storage/report-${reportID}.pdf`;


        await this.reportRepo.update(reportID, tenantId, { ['status']: 'completed', 'progress': 100, 'fileUrl': fileUrl });

        // await this.reportService.update(reportId, {
        //   status: 'COMPLETED',
        //   fileUrl,
        //   progress: 100,
        // });

        const report =
        await this.reportRepo.findOne(reportID, tenantId);

          // -------- actual start


    //       const { reportId, providerId, provider, externalId } = job.data;

    // const providerEntry =
    //   await this.providerRepo.findOne({
    //     where: { id: providerId },
    //   });

    // if (!providerEntry) return;

    // // 🚀 START STEP (only once per cycle)
    // if (!providerEntry.externalId) {

    //   const start =
    //     await this.providerService.startReport(provider);

    //   await this.providerRepo.update(providerId, {
    //     externalId: start.id,
    //     status: 'IN_PROGRESS',
    //     pollAttempts: 0,
    //   });

    //   await job.update({
    //     ...job.data,
    //     externalId: start.id,
    //   });

    //   throw new Error('Start polling');
    // }

    // // 🔄 POLLING STEP
    // const status =
    //   await this.providerService.checkStatus(
    //     provider,
    //     providerEntry.externalId,
    //   );

    // // SUCCESS
    // if (status.status === 'success') {

    //   const data =
    //     await this.providerService.fetchReport(
    //       provider,
    //       status.report_id,
    //     );

    //   await this.providerRepo.update(providerId, {
    //     status: 'COMPLETED',
    //     data,
    //   });

    //   await this.tryFinalize(reportId);

    //   return;
    // }

    // // PROVIDER FAILED IMMEDIATELY
    // if (status.status === 'failed') {
    //   return this.scheduleFullRetry(providerEntry, job);
    // }

    // // STILL PROCESSING
    // const pollAttempts = providerEntry.pollAttempts + 1;

    // if (pollAttempts >= MAX_POLL_ATTEMPTS) {
    //   return this.scheduleFullRetry(providerEntry, job);
    // }

    // await this.providerRepo.update(providerId, {
    //   pollAttempts,
    // });

    // throw new Error('Still processing'); // triggers 10s retry


    // this.reportService.notifyReportReady(report.id, report.tenantID)
    // this.resolver.reportReady(report.id);

    //  this.kafkaProducer.emit('report.ready', {
    //         reportID: report.id,
    //         tenantId: tenantId,
    //         userId: userId,
    //         fileUrl: report.fileUrl,
    //       });

    
    this.kafkaService.emitReportReady({
            reportId: report.id,
            tenantId: tenantId,
            userId: userId,
            fileUrl: report.fileUrl || '',
            generatedAt: new Date(),
          });          

    return { success: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} has been completed!`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  }

//   private async scheduleFullRetry(providerEntry, job: Job) {

//   const newCycle = providerEntry.cycleAttempts + 1;

//   if (newCycle >= MAX_CYCLE_ATTEMPTS) {

//     await this.providerRepo.update(providerEntry.id, {
//       status: 'FAILED',
//     });

//     await this.failReportIfNecessary(providerEntry.reportId);

//     return;
//   }

//   await this.providerRepo.update(providerEntry.id, {
//     externalId: null,
//     pollAttempts: 0,
//     cycleAttempts: newCycle,
//     status: 'RETRY_SCHEDULED',
//   });

//   await job.moveToDelayed(Date.now() + COOLDOWN_DELAY);
// }

// private async tryFinalize(reportId: string) {

//   const completed =
//     await this.providerRepo.count({
//       where: { reportId, status: 'COMPLETED' },
//     });

//   if (completed === 3) {

//     await this.reportRepo.update(reportId, {
//       status: 'COMPLETED',
//       finalReportUrl: `https://storage/${reportId}.pdf`,
//     });
//   }
// }

// private async failReportIfNecessary(reportId: string) {

//   const failed =
//     await this.providerRepo.count({
//       where: { reportId, status: 'FAILED' },
//     });

//   if (failed > 0) {

//     await this.reportRepo.update(reportId, {
//       status: 'FAILED',
//     });
//   }
// }
// }

}