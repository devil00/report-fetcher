import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './users.service';
import { UserDTO } from './dto/user-model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => UserDTO)
export class UsersResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation(() => UserDTO)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) : Promise<UserDTO>{
    return this.usersService.create(createUserInput);
  }

  @Query(() => [UserDTO], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => UserDTO, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => UserDTO)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput): Promise<UserDTO> {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => UserDTO)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
