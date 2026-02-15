import { Injectable } from '@nestjs/common';

import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';


@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>
    ) {}
  
    async create(createUserInput: CreateUserInput): Promise<User> {
      const User = this.userRepository.create(createUserInput);
      return this.userRepository.save(User);
    }
  
    findAll(): Promise<User[]> {
      return this.userRepository.find();
    }
  
    async findOne(id: number): Promise<User> {
      const User = await this.userRepository.findOneBy({ id });
  
      if (!User) {
        throw new Error(`User #${id} not found`);
      }
      return User;
    }
  
    async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
      const user = await this.userRepository.findOneBy({
        id: updateUserInput.id,
      });
      if (!user) {
        throw new Error(`User #${id} not found`); 
      }
  
      if (updateUserInput.username) user.username = updateUserInput.username;
      if (updateUserInput.taxID)
        user.taxID = user.taxID;
      
      return this.userRepository.save(user);
    }
  
    async remove(id: number) {
      const user = await this.userRepository.findOneBy({ id });
  
      if (!user) {
        throw new Error(`User #${id} not found`);
      }
  
      await this.userRepository.delete(id);
      
      return user;
    }
}
