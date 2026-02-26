import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

import type {DataSource} from '../dto/create-tenant.input';

@Entity()
export class Tenant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantID: string;

  @Column()
  tenantName: string;

  @Column('simple-json')
  dataSource: DataSource;
}
