import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant } from "./entities/tenant.entity";
import { TenantDTO } from "../tenant/dto/tenant.model";
import { Repository } from "typeorm";
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantInput: CreateTenantInput): Promise<TenantDTO> {
    const tenant = this.tenantRepository.create(createTenantInput);
    const savedTenant = await this.tenantRepository.save(tenant);
     const res = new TenantDTO();
     res.tenantID = savedTenant.tenantID;
     res.tenantName = savedTenant.tenantName;
     res.dataSource = savedTenant.dataSource;
    return res;
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

  async update(id: number, updateTenantInput: UpdateTenantInput): Promise<TenantDTO> {
    const tenant = await this.tenantRepository.findOneBy({
      id: updateTenantInput.id,
    });
    if (!tenant) {
      throw new Error(`Tenant #${id} not found`); 
    }

    if (updateTenantInput.tenantName) tenant.tenantName = updateTenantInput.tenantName;
    if (updateTenantInput.tenantID)
      tenant.tenantID = tenant.tenantID;
    
    const updatedTenant = await this.tenantRepository.save(tenant);
    const res = new TenantDTO()

    res.tenantID = updatedTenant.tenantID
    res.tenantName = updatedTenant.tenantName;


    return res
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
