import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ReportPollerService {
  private readonly logger = new Logger(ReportPollerService.name);

  // @Cron('10 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 10');
  }
}