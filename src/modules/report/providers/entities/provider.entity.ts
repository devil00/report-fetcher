import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('provider_results')
export class ProviderResult {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportId: number;

  @Column()
  provider: string;

  @Column({ nullable: true })
  externalId: string;

  // pending, done, fail
  @Column({ default: 'PENDING' })
  status: string;

  @Column({ default: 1 })
  pollAttempts: number;

  @Column({ default: 1 })
  cycleAttempts: number;

  @Column({ type: 'jsonb', nullable: true })
  data: any;
}