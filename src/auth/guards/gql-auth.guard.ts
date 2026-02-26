import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Check if the request is a subscription (WebSocket)
    if (request.headers === undefined) {
      // If it's a subscription, the authorization header is in connectionParams
      // and has already been moved to req.headers in the onConnect hook
      return request; 
    }

    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

      let isGraphQL = false;
      try {
        const ctx = GqlExecutionContext.create(context);
        isGraphQL = !!ctx.getContext().req;
      } catch {
        isGraphQL = false;
      }

      // If not GraphQL, maybe it's a REST endpoint or static file
      if (!isGraphQL) {
        // Let it pass or handle differently
        console.log('⚠️ Non-GraphQL request bypassing auth');
        return true; // or false if you want to block
      }

    try {
      const result = await super.canActivate(context);
      
      const ctx = GqlExecutionContext.create(context);
      console.log('✅ Authentication successful, user:', ctx.getContext().req.user);
      
      return result as boolean;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔍 handleRequest - err:', err?.message);
    console.log('🔍 handleRequest - info:', info);
    console.log('🔍 handleRequest - user:', user);
    
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}