import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity'; // Import User entity
import { Report } from '../modules/report/entities/report.entity'; // Import other entities
import { Tenant } from '../tenant/entities/tenant.entity';

import {  } from '../config/configuration';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) {}
    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            // host: this.configService.get<string>('DB_HOST'),
            // username: this.configService.get<string>('DB_USERNAME'),
            // password: this.configService.get<string>('DB_PASSWORD'),
            // port: parseInt(this.configService.getOrThrow<string>('DB_PORT')),

            host:  this.configService.get<string>('postgres.host'),
            username: this.configService.get<string>('postgres.username'),
            password: this.configService.get<string>('postgres.password'),
            port: parseInt(this.configService.getOrThrow<string>('postgres.port')),
            autoLoadEntities: true,
            synchronize: true,
            retryAttempts: 10,        // 👈 Number of retry attempts
            retryDelay: 3000,  
            entities: [
                User,
                Tenant,
        // Add all other entities
      ],      
        }; 
    }
}