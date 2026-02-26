import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { JobNames, QueueNames } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QueueNames.REPORT) private readonly reportQueue: Queue,
  ) {}

  // async addAppointmentJob(data: { userId: string; email: string; name: string }, opts?: JobsOptions) {
  //   // Idempotency via jobId (prevents duplicates)
  //   const jobId = opts?.jobId ?? `welcome:${data.email}`;
  //   return this.appointmentQueue.add(JobNames.SCHEDULE_APPOINTMENT, data, {
  //     jobId,
  //     attempts: 4, // ensure attempts is set on the job so DLQ logic can read it
  //     backoff: { type: 'exponential', delay: 3000 },
  //     ...opts,
  //   });
  // }

  // async addDelayedAppointment(data: { userId: string; email: string; name: string }, delayMs: number) {
  //   return this.addAppointmentJob(data, { delay: delayMs });
  // }

  // async addRepeatableDigest() {
  //   return this.appointmentQueue.add(JobNames.APPOINTMENT_DIGEST, {}, { repeat: { cron: '0 9 * * *' } });
  // }


  // async addGenerateReportJob(data: { userId: string; tenantId: string; reportID:number,name: string }, opts?: JobsOptions) {
  //   // Idempotency via jobId (prevents duplicates)
  //   // const jobId = opts?.jobId ?? `welcome:${data.userId}:${data.reportID}:${data.tenantId}`;

  //   const jobId = opts?.jobId ?? `report_${data.reportID}_${data.tenantId.replace(/:/g, '_')}`;

  //   console.log("=====addGenerateReportJob=====")
  //   console.log(data)
  //   console.log(jobId)
  //   return this.reportQueue.add(JobNames.GENERATE_REPORT, data, {
  //     jobId,
  //     attempts: 4, // ensure attempts is set on the job so DLQ logic can read it
  //     backoff: { type: 'exponential', delay: 3000 },
  //     ...opts,
  //   });
  // }

  async addGenerateReportJob(data: { userId: string; tenantId: string; reportID:number,name: string },): Promise<string> {
    const job = await this.reportQueue.add(JobNames.GENERATE_REPORT, 
      {
        ...data,
        pollAttempts: 0,
        createdAt: new Date().toISOString()
      },
      {
        attempts: 30, // Max polling attempts
        backoff: {
          type: 'fixed',
          delay: 10000, // 10 seconds between attempts
        },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );
  
    return job.id || '';
  }
}