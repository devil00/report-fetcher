import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTenantInput {
    @Field(() => Int, { description: 'Example field (placeholder)' })
    id: number;

    @Field(() => String, { description: 'Example field (placeholder)' })
    tenantID: string;
  
    @Field(() => String, { description: 'Example field (placeholder)' })
    tenantName: string;
}
