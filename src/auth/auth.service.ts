import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  create(createAuthInput: CreateAuthInput) {
    return 'This action adds a new auth';
  }

  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
) { }


  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthInput: UpdateAuthInput) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
