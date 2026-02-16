import { ConfigService } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
  @Inject('KAFKA_SERVICE') private readonly client: ClientKafka, 
  private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Subscribe to topics to ensure readiness
    this.client.subscribeToResponseOf('report.created');
    await this.client.connect();
  }

  getHello(): string {
    // return 'Hello World!';
    return `Application Name from Custom configurations: ${this.configService.get<string>('app.name')}`;  
  }
}
