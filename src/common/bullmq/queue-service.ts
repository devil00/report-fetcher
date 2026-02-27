import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { JobNames, QueueNames } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QueueNames.REPORT) private readonly reportQueue: Queue,
  ) {}

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