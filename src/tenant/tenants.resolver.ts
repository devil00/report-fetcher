import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TenantsService } from './tenants.service';
import { TenantDTO } from '../tenant/dto/tenant.model';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => TenantDTO)
export class TenantsResolver {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Mutation(() => TenantDTO)
  async createTenant(@Args('createTenantInput') createTenantInput: CreateTenantInput): Promise<TenantDTO> {
    return this.tenantsService.create(createTenantInput);
  }

  @Public()
  @Query(() => [TenantDTO], { name: 'tenants' })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Public()
  @Query(() => TenantDTO, { name: 'tenant' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.tenantsService.findOne(id);
  }

  @Public()
  @Mutation(() => TenantDTO)
  async updateTenant(@Args('updateTenantInput') updateTenantInput: UpdateTenantInput) :  Promise<TenantDTO>{
    return this.tenantsService.update(updateTenantInput.id, updateTenantInput);
  }

  @Public()
  @Mutation(() => TenantDTO)
  async removeTenant(@Args('id', { type: () => Int }) id: number) {
    return this.tenantsService.remove(id);
  }
}
