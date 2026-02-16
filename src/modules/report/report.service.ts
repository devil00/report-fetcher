import { Injectable, Inject } from '@nestjs/common';
import { CreateReportInput } from './dto/create-report.input';
import { UpdateReportInput } from './dto/update-report.input';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,

    @Inject('KAFKA_PRODUCER')
    private readonly kafkaProducer: ClientKafka,
  ) {}

  create(createReportInput: CreateReportInput) {
    return 'This action adds a new report';
  }

  findAll() {
    return `This action returns all report`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportInput: UpdateReportInput) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }

  async createReport(name: string, tenantId: string): Promise<Report> {
    const report = this.reportRepo.create({ name, tenantId });
    const saved = await this.reportRepo.save(report);

    await this.kafkaProducer.emit('report.created', {
      reportId: saved.id,
      name,
      tenantId,
      timestamp: new Date(),
    });

    return saved;
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepo.find();
  }
}
