import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Return access token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: { id: number; username: string } }> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      this.logger.error('Login endpoint error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; username: string }> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error('Register endpoint error:', error);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req: { user: { id: number; username: string } }): any {
    return this.authService.getProfile(req.user);
  }
}
