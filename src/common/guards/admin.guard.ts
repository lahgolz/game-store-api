import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { User } from 'src/auth/interfaces/user.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresAdmin = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresAdmin) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();

    if (request.user.role !== 'admin') {
      throw new ForbiddenException(
        'This action requires administrator privileges.',
      );
    }

    return true;
  }
}
