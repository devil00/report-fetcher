import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TenantsService } from './tenants.service';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';

@Resolver(() => Tenant)
export class TenantsResolver {
  constructor(private readonly tenantsService: TenantsService) {}

  @Mutation(() => Tenant)
  async createTenant(@Args('createTenantInput') createTenantInput: CreateTenantInput) {
    return this.tenantsService.create(createTenantInput);
  }

  @Query(() => [Tenant], { name: 'tenants' })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Query(() => Tenant, { name: 'tenant' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tenantsService.findOne(id);
  }

  @Mutation(() => Tenant)
  async updateTenant(@Args('updateTenantInput') updateTenantInput: UpdateTenantInput) {
    return this.tenantsService.update(updateTenantInput.id, updateTenantInput);
  }

  @Mutation(() => Tenant)
  async removeTenant(@Args('id', { type: () => Int }) id: number) {
    return this.tenantsService.remove(id);
  }
}
