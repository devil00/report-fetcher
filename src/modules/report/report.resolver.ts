import { Resolver, Query, Mutation, Args, Int, Context, Subscription,ID } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { Report } from './dto/report';
import { CreateReportInput } from './dto/create-report.input';
import { UpdateReportInput } from './dto/update-report.input';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '../../auth/guards/gql-auth.guard';
import { REDIS_PUBSUB } from '../../common/pubsub/graphql.pubsub.module';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { ReportResponse } from './dto/report-status-response';

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
  async findOne( @Context() context: any, @Args('reportID', { type: () => ID }) reportID: number) : Promise<ReportResponse>{
    const tenantId = context.req.user.tenantId;
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
    @Context() context: any,
  ) : Promise<ReportResponse>{
    let tenantId = context.req.tenantId;
    const userId = context.req.userId;
    console.log("create report")
    console.log(context.req)
    console.log(userId)
    console.log(tenantId)
    tenantId = 'tenant-a';
    return this.reportService.createReport(userId, tenantId);
  }

  @Subscription(() => String, {
    filter: (payload, variables, context) =>
      payload.tenantId === context.req.user.tenantId,
     name: 'reportReady',
  })
  reportReady(reportID: number) {
    console.log("Report ready: ")
    console.log(reportID)
    return this.pubSub.asyncIterableIterator('reportReady');
  }

  // @Mutation(() => Report)
  // createReport(@Args('createReportInput') createReportInput: CreateReportInput) {
  //   return this.reportService.create(createReportInput);
  // }


  @UseGuards(GqlJwtAuthGuard)
  @Query(() => ReportResponse, { name: 'report' })
  async findStatus (@Args('id', { type: () => Int }) id: number, @Context() context: any) :Promise<ReportResponse>{
      const tenantId = context.req.user.tenantId;

    const report = await this.reportService.findOne(id, tenantId);
    return {
      status: report.status
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
