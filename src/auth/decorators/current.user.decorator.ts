// auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface AuthenticatedUser {
  id: number;
  username: string;
  tenantId: string;
  roles: string[];
  token: string; // 👈 Add token to user object
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: AuthenticatedUser = ctx.getContext().req.user;
    
    if (!user) {
      throw new Error('User not found in context. Make sure AuthGuard is applied.');
    }
    
    // If a specific field is requested, return only that
    if (data) {
      return user[data];
    }
    
    // Otherwise return the whole user object
    return user;
  },
);