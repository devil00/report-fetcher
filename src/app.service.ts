import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    // return 'Hello World!';
    return `Application Name from Custom configurations: ${this.configService.get<string>('app.name')}`;  
  }
}
