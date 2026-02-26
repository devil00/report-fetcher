import { ObjectType, Field, Int } from '@nestjs/graphql';

import type { DataSource } from './create-tenant.input';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class TenantDTO {
  @Field(() => String, { description: 'Example field (placeholder)' })
  tenantID: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  tenantName: string;

// Map the column data to the GraphQLJSON scalar
  @Field(() => GraphQLJSON, { nullable: false })
  dataSource: DataSource; 
}
