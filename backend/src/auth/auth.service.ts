import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';

import { JwtService } from '@nestjs/jwt';
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDto) {
    this.logger.log(
      `Registration attempt for username: ${registerDto.username}`,
    );

    try {
      const existingUser = await this.userRepository.findOneBy({
        username: registerDto.username,
      });

      if (existingUser) {
        this.logger.warn(
          `Registration failed: username ${registerDto.username} already exists`,
        );
        throw new BadRequestException('Username already exists');
      }
      const hashedPassword = await bcrypt.hash(
        registerDto.password,
        SALT_ROUNDS,
      );

      // Crear nuevo usuario
      const user = this.userRepository.create({
        username: registerDto.username,
        password: hashedPassword,
      });

      // Guardar en base de datos
      await this.userRepository.save(user);

      this.logger.log(`User registered successfully: ${registerDto.username}`);

      return {
        message: 'User registered successfully',
        username: user.username,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Registration error for ${registerDto.username}:`,
        error,
      );
      throw new InternalServerErrorException(
        'An error occurred during registration',
      );
    }
  }

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findOneBy({ username });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(pass, user.password);

      if (!isPasswordValid) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as Omit<User, 'password'>;
    } catch (error) {
      this.logger.error('Error validating user:', error);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.username}`);
    try {
      // Validar credenciales
      const user = await this.validateUser(
        loginDto.username,
        loginDto.password,
      );

      if (!user) {
        this.logger.warn(`Failed login attempt for: ${loginDto.username}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generar JWT token
      const payload = { username: user.username, sub: user.id };
      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`Successful login for user: ${loginDto.username}`);

      return {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Login error for ${loginDto.username}:`, error);
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  getProfile(user: unknown) {
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...result } = user;
        return result as User;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error fetching user by ID ${id}:`, error);
      return null;
    }
  }
}
