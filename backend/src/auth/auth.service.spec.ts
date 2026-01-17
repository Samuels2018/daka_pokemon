/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashedPassword')),
  compare: jest.fn(() => Promise.resolve(true)),
}));
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: '$2b$10$hashedPassword',
  };

  const mockUserWithoutPassword = {
    id: 1,
    username: 'testuser',
  };

  const mockRegisterDto = {
    username: 'newuser',
    password: 'password123',
    confirmPassword: 'password123',
  };

  const mockLoginDto = {
    username: 'testuser',
    password: 'password123',
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        username: mockRegisterDto.username,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        username: mockRegisterDto.username,
      });

      (bcrypt.hash as jest.Mock)
        .mockReset()
        .mockImplementation(() => Promise.resolve('hashedPassword'));
      (bcrypt.compare as jest.Mock)
        .mockReset()
        .mockImplementation(() => Promise.resolve(true));
      const result = await service.register(mockRegisterDto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: mockRegisterDto.username,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: mockRegisterDto.username,
        password: 'hashedPassword',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'User registered successfully',
        username: mockRegisterDto.username,
      });
    });

    it('should throw BadRequestException if username already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Username already exists',
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      (bcrypt.hash as jest.Mock)
        .mockReset()
        .mockImplementation(() => Promise.resolve('nuevoHash'));
      (bcrypt.compare as jest.Mock)
        .mockReset()
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should hash password with bcrypt salt rounds of 12', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      (bcrypt.hash as jest.Mock)
        .mockReset()
        .mockImplementation(() => Promise.resolve('nuevoHash'));
      (bcrypt.compare as jest.Mock)
        .mockReset()
        .mockImplementation(() => Promise.resolve(false));

      await service.register(mockRegisterDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 12);
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('testuser', 'password123');

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
      expect(result).toEqual(mockUserWithoutPassword);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.password,
      );
      expect(result).toBeNull();
    });

    it('should return null on error and not throw', async () => {
      mockUserRepository.findOneBy.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.validateUser('testuser', 'password123');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data for valid credentials', async () => {
      const mockToken = 'mock.jwt.token';
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockLoginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
      expect(result).toEqual({
        accessToken: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      jest.spyOn(service, 'validateUser').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should not reveal whether username exists (security test)', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      try {
        await service.login(mockLoginDto);
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
        expect(error.message).not.toContain('not found');
        expect(error.message).not.toContain('exist');
      }
    });
  });

  describe('getProfile', () => {
    it('should return user data', () => {
      const result = service.getProfile(mockUserWithoutPassword);

      expect(result).toEqual(mockUserWithoutPassword);
    });
  });

  describe('getUserById', () => {
    it('should return user without password if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUserWithoutPassword);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await service.getUserById(999);

      expect(result).toBeNull();
    });

    it('should return null on error and not throw', async () => {
      mockUserRepository.findOneBy.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.getUserById(1);

      expect(result).toBeNull();
    });
  });
});
