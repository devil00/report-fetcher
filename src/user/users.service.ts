import { Injectable, UnauthorizedException} from '@nestjs/common';

import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { LoginDto } from '../auth/dto/login';
import { SignupDto } from '../auth/dto/signup.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>
    ) {}
  
  async create(createUserInput: CreateUserInput): Promise<User> {
      if (createUserInput && createUserInput.password.length > 0) {
        createUserInput.salt = await bcrypt.genSalt();
        createUserInput.password = await this.hashPassword(createUserInput.password, createUserInput.salt);
      }

      const User = this.userRepository.create(createUserInput);
      return this.userRepository.save(User);
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
      return bcrypt.hash(password, salt);
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

      if (updateUserInput && updateUserInput.password) {
        updateUserInput.password = await this.hashPassword(updateUserInput.password, user.salt);
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

    async findByUsername(userName: string) {
      return await this.userRepository.findOne({ where: { username: userName}, select: { id: true, username: true, password: true} })
    }
  
    async signUp(signupDto: SignupDto): Promise<User> {
      const { password, username } = signupDto;
      const user = new User();
  
      user.salt = await bcrypt.genSalt();
      user.password = await this.hashPassword(password, user.salt);

      user.username = username;
  
      try {
        await user.save();
        return user;
      } catch (error) {
        throw error;
      }
    }
  
    async signIn(loginDto: LoginDto): Promise<User> {
      const { username, password } = loginDto;
  
      const user = await this.userRepository.findOne({
        where: { username },
      });
    
      if (!user || !(await user.validatePassword(password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    }
}
