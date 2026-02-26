// kafka/kafka.service.ts
import { Injectable, Inject,OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_PRODUCER } from '../kafka/kafka.constants';

export interface KafkaMessage {
  key?: string;
  value: any;
  partition?: number;
  headers?: Record<string, any>;
}

export interface ReportCreatedEvent {
  reportId: number;
  tenantId: string;
  createdBy: string;
  timestamp: Date;
  userId: number;
  metadata?: Record<string, any>;
}

export interface ReportReadyEvent {
  reportId: number;
  fileUrl: string;
  generatedAt: Date;
  userId: number;
  tenantId: string;
  size?: number;
  format?: string;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private isConnected = false;

   constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly kafkaClient: ClientKafka,
  ) {}


  async onModuleInit() {
    // First initialize the client
    await this.initializeClient();
    
    // Then wait for Kafka to be ready (with the initialized client)
    await this.waitForKafkaReady();
  }

  private async initializeClient() {
    try {
      this.logger.log('🔧 Initializing Kafka client...');
      
      // Get the client from ModuleRef to avoid circular dependency
      // this.kafkaClient = this.moduleRef.get(KAFKA_PRODUCER, { strict: false });
      
      if (!this.kafkaClient) {
        throw new Error('Kafka client not found in ModuleRef');
      }
      
      this.logger.log('✅ Kafka client initialized');
    } catch (error) {
      this.logger.error(`❌ Failed to initialize Kafka client: ${error.message}`);
      throw error;
    }
  }

  private async waitForKafkaReady(retries = 10, delay = 3000): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        this.logger.log(`Attempting to connect to Kafka (${i + 1}/${retries})...`);
        
        // Subscribe to topics FIRST (before connecting)
        this.logger.log('📡 Subscribing to topics...');
        this.kafkaClient.subscribeToResponseOf('report.create');
        this.kafkaClient.subscribeToResponseOf('report.ready');
        
        // Connect to Kafka
        this.logger.log('🔌 Connecting to Kafka broker...');
        await this.kafkaClient.connect();
        
        // Test connection with a metadata request
        this.logger.log('📤 Sending test message...');
        await this.kafkaClient.emit('connection.test', { 
          test: true,
          timestamp: new Date().toISOString() 
        }).toPromise();
        
        this.isConnected = true;
        this.logger.log('✅ Kafka is ready and connected');
        return;
        
      } catch (error) {
        this.logger.warn(`Kafka not ready yet: ${error.message}`);
        
        // Close the client if it was partially connected
        try {
          await this.kafkaClient?.close();
        } catch (closeError) {
          // Ignore close errors
        }
        
        if (i < retries - 1) {
          this.logger.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          this.logger.error('❌ Kafka failed to become ready after maximum retries');
          throw error;
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async disconnect() {
    if (this.kafkaClient && this.isConnected) {
      try {
        await this.kafkaClient.close();
        this.isConnected = false;
        this.logger.log('🔌 KafkaService disconnected');
      } catch (error) {
        this.logger.error(`Error during disconnect: ${error.message}`);
      }
    }
  }

  private async ensureConnected() {
    if (!this.isConnected || !this.kafkaClient) {
      this.logger.log('🔄 Reconnecting to Kafka...');
      await this.initializeClient();
      await this.waitForKafkaReady();
    }
  }

  /**
   * Emit a report.create event
   */
  async emitReportCreated(data: ReportCreatedEvent): Promise<void> {
    await this.ensureConnected();
    
    this.logger.log(`📤 Emitting report.create for report: ${data.reportId}`);
    
    try {
      await this.kafkaClient.emit('report.create', {
        ...data,
        timestamp: data.timestamp || new Date(),
        _metadata: {
          version: '1.0',
          source: 'nestjs-app',
        }
      }).toPromise();
      
      this.logger.debug(`✅ report.create emitted successfully`);
    } catch (error) {
      this.logger.error(`Failed to emit report.create: ${error.message}`);
      throw error;
    }
  }

  /**
   * Emit a report.ready event
   */
  async emitReportReady(data: ReportReadyEvent): Promise<void> {
    await this.ensureConnected();
    
    this.logger.log(`📤 Emitting report.ready for report: ${data.reportId}`);
    
    try {
      await this.kafkaClient.emit('report.ready', {
        ...data,
        timestamp: new Date(),
      }).toPromise();
      
      this.logger.debug(`✅ report.ready emitted successfully`);
    } catch (error) {
      this.logger.error(`Failed to emit report.ready: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generic emit method for any topic
   */
  async emit(topic: string, message: any): Promise<void> {
    await this.ensureConnected();
    
    this.logger.log(`📤 Emitting to ${topic}`);
    
    try {
      await this.kafkaClient.emit(topic, message).toPromise();
      this.logger.debug(`✅ Emitted to ${topic} successfully`);
    } catch (error) {
      this.logger.error(`Failed to emit to ${topic}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a message and wait for response
   */
  async send<T>(topic: string, message: any): Promise<T> {
    await this.ensureConnected();
    
    this.logger.log(`📤 Sending to ${topic} with response expected`);
    
    try {
      const result = await this.kafkaClient.send(topic, message).toPromise();
      this.logger.debug(`✅ Received response from ${topic}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send to ${topic}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Subscribe to response topics
   */
  subscribeToResponseOf(topic: string): void {
    if (this.kafkaClient) {
      this.kafkaClient.subscribeToResponseOf(topic);
      this.logger.log(`📡 Subscribed to responses of ${topic}`);
    }
  }

  /**
   * Check if Kafka is connected
   */
  isConnectedToKafka(): boolean {
    return this.isConnected;
  }

  /**
   * Get the underlying Kafka client (use with caution)
   */
  getClient(): ClientKafka {
    return this.kafkaClient;
  }
}