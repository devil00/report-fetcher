import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantConnectionService } from './tenant.datasource.service';
import { TenantsResolver } from './tenants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenant/entities/tenant.entity';

@Module({
  providers: [TenantsResolver, TenantsService, TenantConnectionService],
  imports: [
    TypeOrmModule.forFeature([Tenant]), // This registers the repository
  ],
   exports: [TenantsService, TenantConnectionService],
})
export class TenantsModule {}
