import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../auth/dto/login';
import { SignupDto } from '../auth/dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { AuthResponse } from 'src/auth/dto/jwt_auth_response.dto';
import { userInfo } from 'os';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
) { }

async validateUser(userName: string, password: string): Promise<{ status: boolean, payload?: User, message?: string } | null> {
    const user = await this.userService.findByUsername(userName);
    if (user && await bcrypt.compare(password, user.password)) {
        return { "status": true, "payload": user }; // Password matches
    } else {
        return { "status": false, "message": "Invalid email or password!" };
    }
}

async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    // const user = await this.userService.signIn(loginDto);
    if(!user) {
      throw new UnauthorizedException('Invalid Credentials!');
    }

    const payload = {
       sub: user?.payload?.id, 
       name: user?.payload?.username, 
       tax_id: user?.payload?.taxID , 
       tenantID: user?.payload?.tenantID,
      };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRESIN') ?? '10h' as any,
      secret: this.configService.get<string>('JWT_SECRET') ?? 'default_secret',
  });
  

  const signInResponse: AuthResponse = { taxID: user.payload?.taxID || "", userName: user.payload?.username || "", accessToken: access_token };

  return signInResponse;
}

async signUp(signupDto: SignupDto): Promise<User> {
  const {password, username, tenantID, taxID} = signupDto;
    const user = new CreateUserInput();
    user.username = username;
    user.password = password;
    user.tenantID = tenantID;
    user.taxID = taxID;

  return this.userService.signUp(user);
}

}
