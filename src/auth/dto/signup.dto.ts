import { IsString, IsEmail, MinLength, Matches } from 'class-validator';
import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class SignupDto {
//   @IsEmail()
//   email: string;

  @IsString()
  @MinLength(8)
  //regex for password to contain atleast one uppercase, lowercase, number and special character
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must contain uppercase, lowercase, number and special character',
  })
   @Field(() => String, { description: 'Example field (placeholder)' })
  password: string;

  @IsString()
   @Field(() => String, { description: 'Example field (placeholder)' })
  username: string;

  @IsString()
   @Field(() => String, { description: 'Example field (placeholder)' })
  tenantID: string;

  @IsString()
  @Field(() => String, { description: 'Example field (placeholder)' })
  taxID: string;
}