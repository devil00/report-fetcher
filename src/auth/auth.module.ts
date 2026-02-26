import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersModule } from '../user/users.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // secret: configService.get('JWT_SECRET'),
        secret: 'JWT_SECRET',
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') || '1d' },
      }),
    }),
    // Or synchronously (if you don't use ConfigService):
    // JwtModule.register({
    //   secret: 'your-secret-key',
    //   signOptions: { expiresIn: '1d' },
    // }),
  ],
  providers: [AuthService, JwtStrategy, AuthResolver],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
