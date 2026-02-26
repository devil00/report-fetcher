import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { CreateAuthInput } from './dto/create-auth.input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { UserDTO } from 'src/user/dto/user-model';
import { LoginDto } from '../auth/dto/login';
import { SignupDto } from '../auth/dto/signup.dto';
import { Public } from '../auth/decorators/public.decorator';
import { AuthResponse } from './dto/jwt_auth_response.dto';

@Resolver(() => UserDTO)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  // @Mutation(() => Auth)
  // @SkipAuthGuard()
  // createAuth(@Args('createAuthInput') createAuthInput: CreateAuthInput) {
  //   return this.authService.create(createAuthInput);
  // }

  @Public()
  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Public()
  @Mutation(() => UserDTO)
  async signUp(@Args('signUp') signUp: SignupDto): Promise<UserDTO> {
    return this.authService.signUp(signUp);
  }

  // @Query(() => [Auth], { name: 'auth' })
  // findAll() {
  //   return this.authService.login();
  // }

  // @Query(() => Auth, { name: 'auth' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.findOne(id);
  // }

  // @Mutation(() => Auth)
  // updateAuth(@Args('updateAuthInput') updateAuthInput: UpdateAuthInput) {
  //   return this.authService.update(updateAuthInput.id, updateAuthInput);
  // }

  // @Mutation(() => Auth)
  // removeAuth(@Args('id', { type: () => Int }) id: number) {
  //   return this.authService.remove(id);
  // }
}
