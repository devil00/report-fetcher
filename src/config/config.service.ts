import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) {}
    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.configService.get<string>('postgres.host'),
            username: this.configService.get<string>('postgres.username'),
            password: this.configService.get<string>('postgres.password'),
            port: parseInt(this.configService.getOrThrow<string>('postgres.port')),
            autoLoadEntities: true,
            synchronize: true,
        }; 
    }
}