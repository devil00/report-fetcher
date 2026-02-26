import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserDTO {
  @Field(() => String, {  nullable: true , description: 'Example field (placeholder)' })
  tenantID: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  username: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  password: string;

//   @Field(() => String, { description: 'Example field (placeholder)' })
//   role: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  taxID: string;
}
