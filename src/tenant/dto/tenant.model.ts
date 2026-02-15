import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Tenant {
  @Field(() => String, { description: 'Example field (placeholder)' })
  tenantID: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  tenantName: string;
}
