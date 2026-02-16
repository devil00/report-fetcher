import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req.user;
    },
  );

  //  @UseGuards(JwtAuthGuard) in resolver async posts(@CurrentTenant() tenantId: string) {