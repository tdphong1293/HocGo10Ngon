
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Kiểm tra decorator Roles() => Nếu có thì so role, nếu không có thì return true
        const requiredRole = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRole) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new UnauthorizedException('Người dùng chưa đăng nhập');
        }

        if (!user.role) {
            throw new ForbiddenException('Người dùng chưa được phân quyền');
        }

        const hasRole = requiredRole.some(role => role === user.role);
        if (!hasRole) {
            throw new ForbiddenException('Người dùng không có quyền truy cập');
        }

        return true;
    }
}
