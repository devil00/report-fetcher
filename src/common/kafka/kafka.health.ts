// kafka/kafka.health.ts
import { Injectable, Logger } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaHealthCheck {
  private readonly logger = new Logger(KafkaHealthCheck.name);

  constructor(private configService: ConfigService) {}

  async waitForKafka(maxRetries = 30, delayMs = 2000): Promise<boolean> {
    const broker = this.configService.get('KAFKA_BROKER', 'kafka:9092');
    
    this.logger.log(`🔍 Checking Kafka health at ${broker}...`);
    
    const kafka = new Kafka({
      clientId: 'health-check',
      brokers: [broker],
    });

    const admin = kafka.admin();

    for (let i = 0; i < maxRetries; i++) {
      try {
        await admin.connect();
        const clusters = await admin.describeCluster();
        this.logger.log(`✅ Kafka is healthy. Cluster ID: ${clusters.clusterId}`);
        await admin.disconnect();
        return true;
      } catch (error) {
        this.logger.warn(`⏳ Kafka not ready (${i + 1}/${maxRetries}): ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw new Error('Kafka failed to become healthy');
  }
}