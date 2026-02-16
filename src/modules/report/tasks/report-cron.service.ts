import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReportCronService {
  constructor(private readonly pollerService: ReportPollerService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    console.log('Cron triggered');
    await this.pollerService.run();
  }
}
