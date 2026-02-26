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

    //  // Call parent canActivate to run JWT validation
    // const result = (await super.canActivate(context)) as boolean;

    //  // After validation, user and token are attached to request
    // const ctx = GqlExecutionContext.create(context);
    // const req = ctx.getContext().req;
    
    // // Also attach token to context for resolvers that might need it
    // ctx.getContext().token = req.user?.token;
    
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

   handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
