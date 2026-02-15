import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAuthInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  username:string

  @Field(() => Int, { description: 'Example field (placeholder)' })
  password:string
}
