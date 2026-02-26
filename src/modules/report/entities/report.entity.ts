import { PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn,UpdateDateColumn, Entity } from 'typeorm';

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity()
export class Report {
  @Column()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({default: 'PENDING'})
  status: string;

  @Column({})
  userID: number;

   @Column({})
  tenantID: string;

  @Column({default: 0})
  progress: number;

  @Column({ nullable: true })
  fileUrl?: string; 

  @CreateDateColumn({ nullable: true })
  startedAt: Date;

  @UpdateDateColumn({ nullable: true })
  finishedAt: Date;
}