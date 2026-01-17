/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockRegisterDto: RegisterDto = {
    username: 'testuser',
    password: 'password123',
    confirmPassword: 'password123',
  };

  const mockLoginDto: LoginDto = {
    username: 'testuser',
    password: 'password123',
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
  };

  const mockLoginResponse = {
    accessToken: 'mock.jwt.token',
    user: mockUser,
  };

  const mockRegisterResponse = {
    message: 'User registered successfully',
    username: 'testuser',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(mockRegisterDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(mockRegisterResponse);
    });

    it('should throw BadRequestException if username already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Username already exists'),
      );

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'Username already exists',
      );
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Unexpected error');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(error);
    });

    it('should call register with correct DTO properties', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      await controller.register(mockRegisterDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          username: mockRegisterDto.username,
          password: mockRegisterDto.password,
          confirmPassword: mockRegisterDto.confirmPassword,
        }),
      );
    });
  });

  describe('login', () => {
    it('should successfully login and return access token', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual(mockLoginResponse);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should propagate service errors', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(error);
    });

    it('should call login with correct credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      await controller.login(mockLoginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          username: mockLoginDto.username,
          password: mockLoginDto.password,
        }),
      );
    });

    it('should return token in expected format', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.username).toBe(mockUser.username);
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const mockRequest = {
        user: mockUser,
      };
      mockAuthService.getProfile.mockReturnValue(mockUser);

      const result: typeof mockLoginResponse =
        controller.getProfile(mockRequest);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should return correct user data structure', () => {
      const mockRequest = {
        user: mockUser,
      };
      mockAuthService.getProfile.mockReturnValue(mockUser);

      const result: typeof mockLoginResponse =
        controller.getProfile(mockRequest);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
      expect(result).not.toHaveProperty('password');
    });

    it('should pass request.user to service', () => {
      const mockRequest = {
        user: { id: 2, username: 'anotheruser' },
      };
      mockAuthService.getProfile.mockReturnValue(mockRequest.user);

      controller.getProfile(mockRequest);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockRequest.user);
    });
  });

  describe('integration tests', () => {
    it('should handle complete registration flow', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const registerResult = await controller.register(mockRegisterDto);

      expect(registerResult.message).toContain('successfully');
      const loginResult = await controller.login({
        username: mockRegisterDto.username,
        password: mockRegisterDto.password,
      });

      expect(loginResult.accessToken).toBeDefined();
    });

    it('should prevent duplicate registration', async () => {
      mockAuthService.register
        .mockResolvedValueOnce(mockRegisterResponse)
        .mockRejectedValueOnce(
          new BadRequestException('Username already exists'),
        );

      await controller.register(mockRegisterDto);
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('error handling', () => {
    it('should catch and re-throw service errors in register', async () => {
      const error = new Error('Database connection failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(error);
    });

    it('should catch and re-throw service errors in login', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);
      await expect(controller.login(mockLoginDto)).rejects.toThrow(error);
    });

    it('should handle null/undefined user in getProfile gracefully', () => {
      const mockRequest = { user: null };
      mockAuthService.getProfile.mockReturnValue(null);

      const result: typeof mockLoginResponse =
        controller.getProfile(mockRequest);

      expect(result).toBeNull();
    });
  });
});
