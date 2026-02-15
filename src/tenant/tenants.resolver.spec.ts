import { Test, TestingModule } from '@nestjs/testing';
import { TenantsResolver } from './tenants.resolver';
import { TenantsService } from './tenants.service';

describe('TenantsResolver', () => {
  let resolver: TenantsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantsResolver, TenantsService],
    }).compile();

    resolver = module.get<TenantsResolver>(TenantsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
