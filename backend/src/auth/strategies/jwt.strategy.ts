import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Logger } from '@nestjs/common';

export interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET must be defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    this.logger.log('JWT Strategy initialized');
  }

  async validate(payload: JwtPayload) {
    try {
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn('JWT payload missing user ID');
        throw new UnauthorizedException('Invalid token payload');
      }

      // Buscar usuario en base de datos
      const user = await this.authService.getUserById(userId);

      if (!user) {
        this.logger.warn(`User not found for ID: ${userId}`);
        throw new UnauthorizedException('User not found');
      }

      // El usuario será inyectado en req.user
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('JWT validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
