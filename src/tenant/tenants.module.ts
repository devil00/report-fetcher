import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsResolver } from './tenants.resolver';

@Module({
  providers: [TenantsResolver, TenantsService],
})
export class TenantsModule {}
