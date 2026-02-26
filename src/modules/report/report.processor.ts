import { Injectable, Logger} from '@nestjs/common';

import { KafkaService } from '../../common/kafka/kafka.service';
import { ReportService } from './report.service';
import { ReportRepository } from './report.repository';
import { ReportProviderRepository } from './providers/provider.repo';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNames } from 'src/common/bullmq/queue.constants';

// const MAX_POLL_ATTEMPTS = 10;        // 10 polls × 10s = 100s
// const MAX_CYCLE_ATTEMPTS = 3;        // full restart limit
// const POLL_DELAY = 10000;            // 10 seconds
// const COOLDOWN_DELAY = 60000;  

@Processor(QueueNames.REPORT)
@Injectable()
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);
  private readonly MAX_POLL_ATTEMPTS = 30;

  constructor(
    private readonly reportService: ReportService,
    private readonly reportRepo: ReportRepository,
    private readonly reporProviderRepo: ReportProviderRepository,
    private readonly kafkaService: KafkaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, tenantId, reportID, name, pollAttempts = 0 } = job.data;

    this.logger.log(`🔄 Processing job ${job.id} for report ${reportID} (attempt ${pollAttempts + 1})`);

    try {
      // Check max attempts
      if (pollAttempts >= this.MAX_POLL_ATTEMPTS) {
        throw new Error('Max polling attempts reached');
      }

      // Update progress
      await job.updateProgress(Math.min(20 + (pollAttempts * 3), 90));

      // 🚀 CALL THREE APIS IN PARALLEL
      const [api1Result, api2Result, api3Result] = await Promise.all([
        this.callApi1(reportID, tenantId),
        this.callApi2(reportID, tenantId),
        this.callApi3(reportID, tenantId),
      ]);

      this.logger.log(`📡 API Results:`, {
        api1: api1Result.status,
        api2: api2Result.status,
        api3: api3Result.status,
      });

      // Check if all APIs are complete
      const allComplete = 
        api1Result.status === 'complete' &&
        api2Result.status === 'complete' &&
        api3Result.status === 'complete';

      if (allComplete) {
        // 🎯 JOIN THE RESULTS
        const aggregatedData = {
          reportID,
          tenantId,
          userId,
          completedAt: new Date().toISOString(),
          api1: api1Result.data,
          api2: api2Result.data,
          api3: api3Result.data,
          // Merge all data
          mergedData: {
            ...api1Result.data,
            ...api2Result.data,
            ...api3Result.data,
          },
        };

        this.logger.log(`******* All APIs complete for report ${reportID}`);

        // Generate file URL
        const fileUrl = `https://storage/report-${reportID}.pdf`;

        // Update database
        await this.reportRepo.update(reportID, tenantId, {
          status: 'COMPLETED',
          progress: 100,
          fileUrl,
          // aggregatedData, // Store joined results
          finishedAt: new Date(),
        });

        // Fetch updated report
        const report = await this.reportRepo.findOne(reportID, tenantId);

        // Emit Kafka event
        await this.kafkaService.emitReportReady({
          reportId: report.id,
          tenantId,
          userId,
          fileUrl,
          generatedAt: new Date(),
        });

        await job.updateProgress(100);

        return { 
          success: true, 
          reportID,
          fileUrl,
          data: aggregatedData 
        };
      }

      // ⏳ SOME APIS STILL PROCESSING - Check which ones are pending
      const pendingApis: string[] = [];
      if (api1Result.status !== 'complete') pendingApis.push('API 1');
      if (api2Result.status !== 'complete') pendingApis.push('API 2');
      if (api3Result.status !== 'complete') pendingApis.push('API 3');

      this.logger.log(`⏳ Pending APIs for report ${reportID}: ${pendingApis.join(', ')}`);

      // Update job data with current status
      await job.updateData({
        ...job.data,
        pollAttempts: pollAttempts + 1,
        lastPollTime: new Date().toISOString(),
        apiStatus: {
          api1: api1Result.status,
          api2: api2Result.status,
          api3: api3Result.status,
        },
      });

      // Update report progress in database
      await this.reportRepo.update(reportID, tenantId, {
        status: 'PROCESSING',
        progress: Math.min(20 + (pollAttempts * 3), 80),
        // apiStatus: {
        //   api1: provider1Result.status,
        //   api2: provider2Result.status,
        //   api3: provider3Result.status,
        // },
      });

      // Throw to trigger BullMQ retry
      throw new Error('STILL_PROCESSING');

    } catch (error) {
      if (error.message === 'STILL_PROCESSING') {
        // Let BullMQ handle retry
        throw error;
      }

      this.logger.error(`===> Fatal error for report ${reportID}: ${error.message}`);
      
      await this.reportRepo.update(reportID, tenantId, {
        status: 'FAILED',
      });
      
      throw error;
    }
  }

  /**
   * Mock API calls - Replace with actual HTTP requests
   */
  private async callApi1(reportID: number, tenantId: string): Promise<any> {
    this.logger.log(`📞 Calling API 1 for report ${reportID}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    // Simulate different statuses based on reportID or attempts
    const status = this.simulateApiStatus(reportID, 1);
    
    return {
      status: status,
      data: status === 'complete' ? {
        source: 'api1',
        data: `Data from API 1 for report ${reportID}`,
        timestamp: new Date().toISOString(),
        metrics: { responseTime: 123, confidence: 0.95 }
      } : null
    };
  }

  private async callApi2(reportID: number, tenantId: string): Promise<any> {
    this.logger.log(`📞 Calling API 2 for report ${reportID}`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const status = this.simulateApiStatus(reportID, 2);
    
    return {
      status: status,
      data: status === 'complete' ? {
        source: 'api2',
        data: `Data from API 2 for report ${reportID}`,
        timestamp: new Date().toISOString(),
        metrics: { responseTime: 234, confidence: 0.88 }
      } : null
    };
  }

  private async callApi3(reportID: number, tenantId: string): Promise<any> {
    this.logger.log(`📞 Calling API 3 for report ${reportID}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const status = this.simulateApiStatus(reportID, 3);
    
    return {
      status: status,
      data: status === 'complete' ? {
        source: 'api3',
        data: `Data from API 3 for report ${reportID}`,
        timestamp: new Date().toISOString(),
        metrics: { responseTime: 345, confidence: 0.92 }
      } : null
    };
  }

  /**
   * Simulate API status for demo purposes
   * Replace with actual API response parsing
   */
  private simulateApiStatus(reportID: number, apiNumber: number): string {
    // For demo: APIs complete at different rates
    // API 1 completes faster, API 2 slower, API 3 medium
    const thresholds = {
      1: 0.7,  // 70% chance of completion
      2: 0.3,  // 30% chance of completion
      3: 0.5,  // 50% chance of completion
    };
    
    // Use reportID to make it deterministic
    const random = ((reportID * apiNumber) % 100) / 100;
    return random < thresholds[apiNumber] ? 'complete' : 'processing';
  }

  /**
   * Alternative: Real API calls with fetch
   */
  private async callRealApi1(reportID: number, tenantId: string): Promise<any> {
    try {
      const response = await fetch(`https://api1.example.com/reports/${reportID}`, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      
      if (!response.ok) {
        throw new Error(`API 1 failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        status: data.status === 'ready' ? 'complete' : 'processing',
        data: data.status === 'ready' ? data.result : null
      };
    } catch (error) {
      this.logger.error(`API 1 call failed: ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`***** Job ${job.id} completed - All APIs joined`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`======> Job ${job.id} failed: ${err.message}`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.log(`📊 Job ${job.id} progress: ${progress}%`);
  }
}