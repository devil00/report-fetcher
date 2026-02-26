import { InputType, Int, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

export interface DataSource {
    host: string; 
    username: string;
    password: string;
    port: number;
    db: string,
}

@InputType()
export class CreateTenantInput {
    // @Field(() => Int, { description: 'Example field (placeholder)' })
    // id: number;

    @Field(() => String, { description: 'Example field (placeholder)' })
    tenantID: string;
  
    @Field(() => String, { description: 'Example field (placeholder)' })
    tenantName: string;

    // Map the column data to the GraphQLJSON scalar
    @Field(() => GraphQLJSON, { nullable: true })
    dataSource: DataSource; 
}
