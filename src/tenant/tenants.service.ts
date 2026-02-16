import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant } from "./entities/tenant.entity";
import { Repository } from "typeorm";
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantInput: CreateTenantInput): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantInput);
    return this.tenantRepository.save(tenant);
  }

  findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOneBy({ id });

    if (!tenant) {
      throw new Error(`Tenant #${id} not found`);
    }
    return tenant;
  }

  async update(id: number, updateTenantInput: UpdateTenantInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOneBy({
      id: updateTenantInput.id,
    });
    if (!tenant) {
      throw new Error(`Tenant #${id} not found`); 
    }

    if (updateTenantInput.tenantName) tenant.tenantName = updateTenantInput.tenantName;
    if (updateTenantInput.tenantID)
      tenant.tenantID = tenant.tenantID;
    
    return this.tenantRepository.save(tenant);
  }

  async remove(id: number) {
    const tenant = await this.tenantRepository.findOneBy({ id });

    if (!tenant) {
      throw new Error(`Tenant #${id} not found`);
    }

    await this.tenantRepository.delete(id);
    
    return tenant;
  }
}
