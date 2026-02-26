import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersResolver } from './users.resolver';


import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
@Module({
  providers: [UsersResolver, UserService],
   imports: [
    TypeOrmModule.forFeature([User]), // This registers the repository
  ],
   exports: [UserService],
})
export class UsersModule {}
