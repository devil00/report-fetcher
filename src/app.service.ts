import { ConfigService } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

// import { KAFKA_PRODUCER } from './common/kafka/kafka.module';

@Injectable()
export class AppService {
  constructor(
  // @Inject(KAFKA_PRODUCER) private readonly client: ClientKafka, 
  private readonly configService: ConfigService) {}

  // async onModuleInit() {
  //   // Subscribe to topics to ensure readiness
  //   this.client.subscribeToResponseOf('report.create');
  //   await this.client.connect();
  // }


  @Public()
  getHello(): string {
    // return 'Hello World!';
    return `Application Name from Custom configurations: ${this.configService.get<string>('app.name')}`;  
  }
}
