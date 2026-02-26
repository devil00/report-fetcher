import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from './queue.constants';
import { QueueService } from './queue-service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueNames.REPORT,
      // per-queue defaults (can override root defaults)
      defaultJobOptions: {
        attempts: 4,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { age: 1800, count: 500 },
        removeOnFail: { age: 24 * 3600, count: 1000 },
      },
    }),
    BullModule.registerQueue({
      name: QueueNames.APPOINTMENT_DLQ,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
