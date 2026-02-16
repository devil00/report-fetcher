import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Report {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
