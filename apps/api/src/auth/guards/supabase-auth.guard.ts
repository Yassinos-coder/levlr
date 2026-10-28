import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthenticatedRequest } from '@/auth/interfaces';

const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly issuer: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(config: ConfigService) {
    const supabaseUrl = config.get<string>('supabase.url') ?? '';
    this.issuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith(BEARER_PREFIX)) throw new UnauthorizedException('Missing bearer token');

    try {
      const { payload } = await jwtVerify(header.slice(BEARER_PREFIX.length), this.jwks, { issuer: this.issuer });
      if (!payload.sub) throw new UnauthorizedException('Token has no subject');
      request.userId = payload.sub;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid token');
    }
  }
}
