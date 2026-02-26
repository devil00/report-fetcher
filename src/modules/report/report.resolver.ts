import { Resolver, Query, Mutation, Args, Int, Context, Subscription,ID } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '../../auth/guards/gql-auth.guard';
import { REDIS_PUBSUB } from '../../common/pubsub/graphql.pubsub.module';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { ReportResponse } from './dto/report-status-response';
import { CurrentUser } from '../../auth/decorators/current.user.decorator';


@Resolver(() => ReportResponse)
export class ReportResolver {

  constructor(
    @Inject(REDIS_PUBSUB) private readonly pubSub: PubSub,
    private readonly reportService: ReportService) {}

  // @UseGuards(AuthGuard)
  // @Query(() => [Report])
  // async findAll() {
  //   return this.reportService.findAll();
  // }


  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [ReportResponse])
  async findOne( @CurrentUser() user: any, @Args('reportID', { type: () => ID }) reportID: number) : Promise<ReportResponse>{
    let tenantId = user?.tenantId;
    const report = await  this.reportService.findOne(reportID, tenantId);
    const res = new ReportResponse();
    res.progress = report.progress;
    res.reportID = report.id;
    res.fileURL = report.fileUrl;
    res.progress = report.progress;
    return res
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ReportResponse)
  async createReport(
    @CurrentUser() user: any, // Gets full user object
  ) : Promise<ReportResponse>{
  
    console.log("create report");
    console.log("User from context:", user);
    
    let userId = user?.userId;
    let tenantId = user?.tenantId;
    
    console.log("userId:", userId);
    console.log("tenantId:", tenantId);
    return this.reportService.createReport(userId, tenantId);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Subscription(() => String, {
    name: 'reportReady',
    filter: (payload, variables, context) => {
      console.log("resolver Report ready: ")
      console.log('🔍 Subscription filter - payload:', payload);
      console.log('🔍 Subscription filter - context:', context);

      console.log('🔍 Subscription filter - context:', {
        hasUser: !!context?.req?.user,
        user: context?.req?.user,
      });
      
      // Safely access user from context
      const user = context?.req?.user;
      
      if (!user) {
        console.log('⚠️ No user in subscription context');
        return false;
      }
      
      // Check if the payload belongs to this user's tenant
      const hasAccess = payload.userId === user.tenantId; 
      console.log(`🔍 Filter result: ${hasAccess} (payload tenant: ${payload.tenantId}, user tenant: ${user.tenantId})`);
      
      return hasAccess;
    },
  })
  reportReady() {
    console.log("📡 Subscriber connected to reportReady");
    return this.pubSub.asyncIterableIterator('reportReady');
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => ReportResponse, { name: 'status' })
  async findStatus (@Args('id', { type: () => Int }) id: number, @Context() context: any) :Promise<ReportResponse>{
      const tenantId = context.req.user.tenantId;

    const report = await this.reportService.findOne(id, tenantId);
    return {
      status: report.status
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => ReportResponse, { name: 'getReportUrl' })
  async findReportUrl (@Args('id', { type: () => Int }) id: number, @Context() context: any) :Promise<ReportResponse>{
      const tenantId = context.req.user.tenantId;

    const report = await this.reportService.findOne(id, tenantId);
    return {
      status: report.status,
      fileURL: report.fileUrl
    }
  }

  // @Mutation(() => Report)
  // updateReport(@Args('updateReportInput') updateReportInput: UpdateReportInput) {
  //   return this.reportService.update(updateReportInput.id, updateReportInput);
  // }

  // @Mutation(() => Report)
  // removeReport(@Args('id', { type: () => Int }) id: number) {
  //   return this.reportService.remove(id);
  // }
}
