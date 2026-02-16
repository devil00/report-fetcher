import { DataSource, DataSourceOptions } from "typeorm";
import { Injectable } from '@nestjs/common';
import { Tenant } from "./entities/tenant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ConfigService } from '@nestjs/config';


@Injectable()
export class TenantConnectionService {
  private dataSources = new Map<string, DataSource>();

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly configService: ConfigService,
  ) {}

  
  async getDataSource(tenantId: string): Promise<DataSource> {
   
    const existing = this.dataSources.get(tenantId);

    if (existing) {
        return existing;
    }

    const tenant = await this.tenantRepo.findOneBy({ tenantID: tenantId });
    if (!tenant) throw new Error(`Tenant #${tenantId} not found`);;
    

    const dataSource = new DataSource({
        type: 'postgres',
        host: this.configService.get<string>('postgres.host'),
        username: this.configService.get<string>('postgres.username'),
        password: this.configService.get<string>('postgres.password'),
        port: parseInt(this.configService.getOrThrow<string>('postgres.port')),
        synchronize: true,
    });

    await dataSource.initialize();
    this.dataSources.set(tenantId, dataSource);

    return dataSource;
  }
}



// constructor(
//    private readonly tenantConnection: TenantConnectionService,
 // ) {}


 // constructor(
  // @Inject(Order)
  //private readonly orderRepo: Repository<Order>,
// ) {}

/**
 * 
 * @Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [Order])
  async orders() {
    return this.ordersService.findAll();
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Order)
  async createOrder(
    @Args('product') product: string,
    @Args('price') price: number,
  ) {
    return this.ordersService.create(product, price);
  }
}
 * **/