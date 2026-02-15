import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RoleEnum { ADMIN="ADMIN", USER="USER"}

@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  // @Column({
  //   type:'enum',
  //   enum: RoleEnum,
  //   default: RoleEnum.USER
  // })
  // role: RoleEnum;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  taxID: string;
}
