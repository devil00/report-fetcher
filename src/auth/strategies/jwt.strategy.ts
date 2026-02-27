import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      // secretOrKey: 'default',
      passReqToCallback: true, // Pass request to callback
    });
  }

  async validate(req: any, payload: any) {
    console.log('✅ JWT validated, payload:');
    console.log('========== JWT VALIDATE ==========');
    console.log('🔍 PAYLOAD:', JSON.stringify(payload, null, 2));
    console.log('🔍 PAYLOAD KEYS:', Object.keys(payload || {}));
    console.log('==================================');
    return {
      id: payload.sub || payload.userId, // Support both formats
      userId: payload.userId,
      username: payload.username,
      tenantId: payload.tenantId,
      sub: payload.sub,
      userID: payload.userID,
      tenantID: payload.tenantId,
    };
  }
}