import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @Field(() => String, { description: 'Example field (placeholder)' })
    email:string

    @IsString()
    @IsNotEmpty()
    @Field(() => String, { description: 'Example field (placeholder)' })
    password:string
}