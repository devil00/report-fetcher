import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;

    id: number;
    
    // @Field()
    // role: RoleEnum;
  
    @Field()
    username: string;
  
    @Field()
    password: string;
  
    @Field()
    taxID: string;
}
