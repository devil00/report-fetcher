import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobNames, QueueNames } from './queue.constants';

@Processor(QueueNames.REPORT_DLQ)
@Injectable()
export class DlqProcessor extends WorkerHost {
  private readonly logger = new Logger(DlqProcessor.name);

  async process(job: Job<{
    originalJobId: string;
    name: string;
    queue: string;
    data: any;
    reason: string;
    attemptsMade: number;
    maxAttempts: number | null;
    failedAt: string;
  }>) {
    this.logger.warn(
      `DLQ: jobId=${job.id} original=${job.data.originalJobId} reason="${job.data.reason}"`,
    );

    // TODO:
    // - Persist to DB for triage
    // - Create an incident/alert
    // - Optionally implement auto-retry logic back to main queue after inspection

    return { handled: true };
  }
}