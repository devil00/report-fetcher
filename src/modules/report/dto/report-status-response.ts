import { ObjectType, Field } from '@nestjs/graphql';
// import { Report } from '../entities/report.entity';

@ObjectType()
export class ReportResponse {
  @Field()
  status: string; // e.g., "SUCCESS"

  // @Field(() => Report, { nullable: true })
  // report?: Report;

  @Field({nullable: true})
  reportID?: number;

  @Field({nullable: true})
  fileURL?: string;

  @Field({nullable: true})
  progress?: number;
}