import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { Report } from './entities/report.entity';
import { CreateReportInput } from './dto/create-report.input';
import { UpdateReportInput } from './dto/update-report.input';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/jwtauth.guard';

@Resolver(() => Report)
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(AuthGuard)
  @Query(() => [Report])
  async reports() {
    return this.reportService.findAll();
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Report)
  async createReport(
    @Args('name') name: string,
    @Context() context,
  ) {
    const tenantId = context.req.user.tenantId;
    return this.reportService.createReport(name, tenantId);
  }

  // @Mutation(() => Report)
  // createReport(@Args('createReportInput') createReportInput: CreateReportInput) {
  //   return this.reportService.create(createReportInput);
  // }

  @Query(() => [Report], { name: 'report' })
  findAll() {
    return this.reportService.findAll();
  }

  @Query(() => Report, { name: 'report' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.reportService.findOne(id);
  }

  @Mutation(() => Report)
  updateReport(@Args('updateReportInput') updateReportInput: UpdateReportInput) {
    return this.reportService.update(updateReportInput.id, updateReportInput);
  }

  @Mutation(() => Report)
  removeReport(@Args('id', { type: () => Int }) id: number) {
    return this.reportService.remove(id);
  }
}
