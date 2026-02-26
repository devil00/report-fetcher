import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum RoleEnum { ADMIN="ADMIN", USER="USER"}
@Entity()
export class User extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;
  
  // @Column({
  //   type:'enum',
  //   enum: RoleEnum,
  //   default: RoleEnum.USER
  // })
  // role: RoleEnum;

  @Column({unique: true})
  username: string;

  @Column()
  password: string;

  @Column()
  taxID: string;  

  @Column()
  salt: string;

  @Column()
  tenantID: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
