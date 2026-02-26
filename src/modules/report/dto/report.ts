import { ObjectType, Field, ID ,GraphQLISODateTime} from '@nestjs/graphql';

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@ObjectType()
export class Report {
  @Field(() => ID)
  id: string;

  @Field()
  status: string;

  @Field()
  progress: number;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field(() => GraphQLISODateTime) // Correctly maps Date to String
  createdAt: Date

  @Field(() => GraphQLISODateTime) // Correctly maps Date to String
  updatedAt: Date
}