import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateReportInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  id: number;

  @Field(() => String, { description: 'Example field (placeholder)' })
  startTime: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  endTime: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  status: string;
}
