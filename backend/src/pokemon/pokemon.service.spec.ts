/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { BadGatewayException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PokemonService', () => {
  let service: PokemonService;

  const mockPokeApiResponse = {
    data: {
      id: 25,
      name: 'pikachu',
      sprites: {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      },
    },
  };

  const mockInvalidPokeApiResponse = {
    data: {
      id: 25,
      name: 'pikachu',
      sprites: {},
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonService],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRandomSprite', () => {
    it('should return a random pokemon sprite successfully', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);

      const result = await service.getRandomSprite();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('name');
      expect(result.url).toBe(mockPokeApiResponse.data.sprites.front_default);
      expect(result.name).toBe(mockPokeApiResponse.data.name);
      expect(typeof result.id).toBe('number');
    });

    it('should call PokeAPI with correct URL format', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);

      await service.getRandomSprite();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/^https:\/\/pokeapi\.co\/api\/v2\/pokemon\/\d+$/),
        expect.objectContaining({ timeout: 5000 }),
      );
    });

    it('should generate random pokemon ID between 1 and 898', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);

      const calls = 10;
      for (let i = 0; i < calls; i++) {
        await service.getRandomSprite();
      }

      const callArgs = mockedAxios.get.mock.calls;
      callArgs.forEach((call) => {
        const url = call[0];
        const id = parseInt(url.split('/').pop() || '0');
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(898);
      });
    });

    it('should include timeout in axios request', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);

      await service.getRandomSprite();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 5000 }),
      );
    });

    it('should store sprite in memory', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      await service.getRandomSprite();
      const sprites = service.findAll();

      expect(sprites.length).toBe(1);
      expect(sprites[0].name).toBe('pikachu');
    });

    it('should add multiple sprites to memory', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);

      await service.getRandomSprite();
      await service.getRandomSprite();
      await service.getRandomSprite();

      const sprites = service.findAll();

      expect(sprites.length).toBe(3);
    });

    it('should throw BadGatewayException if sprite URL is missing', async () => {
      mockedAxios.get.mockResolvedValue(mockInvalidPokeApiResponse);

      await expect(service.getRandomSprite()).rejects.toThrow(
        BadGatewayException,
      );
      await expect(service.getRandomSprite()).rejects.toThrow(
        'Unable to fetch pokemon from external API',
      );
    });

    it('should throw BadGatewayException if name is missing', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          id: 25,
          sprites: { front_default: 'https://example.com/sprite.png' },
        },
      });

      await expect(service.getRandomSprite()).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should throw BadGatewayException on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.getRandomSprite()).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should throw BadGatewayException on timeout', async () => {
      const timeoutError = new Error('Timeout');
      (timeoutError as any).code = 'ECONNABORTED';
      mockedAxios.get.mockRejectedValue(timeoutError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(service.getRandomSprite()).rejects.toThrow(
        BadGatewayException,
      );
      await expect(service.getRandomSprite()).rejects.toThrow(
        'Request to PokeAPI timed out',
      );
    });

    it('should throw BadGatewayException on 404 response', async () => {
      const error = {
        response: { status: 404 },
        isAxiosError: true,
      };
      mockedAxios.get.mockRejectedValue(error);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(service.getRandomSprite()).rejects.toThrow(
        BadGatewayException,
      );
      await expect(service.getRandomSprite()).rejects.toThrow(
        'Pokemon not found in PokeAPI',
      );
    });

    it('should use timestamp as sprite ID', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      const beforeTimestamp = Date.now();

      const result = await service.getRandomSprite();
      const afterTimestamp = Date.now();

      expect(result.id).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(result.id).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe('findAll', () => {
    it('should return empty array initially', () => {
      const result = service.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return all stored sprites', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      await service.getRandomSprite();
      await service.getRandomSprite();

      const result = service.findAll();

      expect(result.length).toBe(2);
    });
  });

  describe('create', () => {
    it('should create a sprite manually', () => {
      const dto = {
        url: 'https://example.com/sprite.png',
        name: 'custom-pokemon',
      };

      const result = service.create(dto);

      expect(result).toBeDefined();
      expect(result.url).toBe(dto.url);
      expect(result.name).toBe(dto.name);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('number');
    });

    it('should add created sprite to storage', () => {
      const dto = {
        url: 'https://example.com/sprite.png',
        name: 'test-pokemon',
      };

      service.create(dto);
      const sprites = service.findAll();

      expect(sprites.length).toBe(1);
      expect(sprites[0].name).toBe(dto.name);
    });

    it('should generate unique timestamp IDs', () => {
      const dto1 = { url: 'url1.png', name: 'pokemon1' };
      const dto2 = { url: 'url2.png', name: 'pokemon2' };

      const sprite1 = service.create(dto1);
      const sprite2 = service.create(dto2);

      expect(sprite1.id).not.toBe(sprite2.id);
    });
  });

  describe('findOne', () => {
    it('should return sprite by ID', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      const sprite = await service.getRandomSprite();

      const result = service.findOne(sprite.id);

      expect(result).toEqual(sprite);
    });

    it('should return undefined if sprite not found', () => {
      const result = service.findOne(999999);

      expect(result).toBeUndefined();
    });

    it('should find manually created sprites', () => {
      const dto = { url: 'test.png', name: 'test' };
      const created = service.create(dto);

      const found = service.findOne(created.id);

      expect(found).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update sprite URL', () => {
      const sprite = service.create({ url: 'old.png', name: 'pokemon' });
      const newUrl = 'new.png';

      const result = service.update(sprite.id, { url: newUrl });

      expect(result).toBeDefined();
      expect(result?.url).toBe(newUrl);
      expect(result?.name).toBe('pokemon');
    });

    it('should update sprite name', () => {
      const sprite = service.create({ url: 'sprite.png', name: 'oldname' });
      const newName = 'newname';

      const result = service.update(sprite.id, { name: newName });

      expect(result).toBeDefined();
      expect(result?.name).toBe(newName);
      expect(result?.url).toBe('sprite.png');
    });

    it('should update both URL and name', () => {
      const sprite = service.create({ url: 'old.png', name: 'oldname' });

      const result = service.update(sprite.id, {
        url: 'new.png',
        name: 'newname',
      });

      expect(result?.url).toBe('new.png');
      expect(result?.name).toBe('newname');
    });

    it('should return null if sprite not found', () => {
      const result = service.update(999999, { name: 'newname' });

      expect(result).toBeNull();
    });

    it('should persist updates in storage', () => {
      const sprite = service.create({ url: 'old.png', name: 'oldname' });

      service.update(sprite.id, { name: 'newname' });
      const found = service.findOne(sprite.id);
      expect(found?.name).toBe('newname');
    });
  });

  describe('remove', () => {
    it('should delete sprite by ID and return success', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      const sprite = await service.getRandomSprite();

      const result = service.remove(sprite.id);

      expect(result.deleted).toBe(true);
      expect(result.id).toBe(sprite.id);
      expect(service.findAll().length).toBe(0);
    });

    it('should return deleted: false if sprite not found', () => {
      const result = service.remove(999999);

      expect(result.deleted).toBe(false);
      expect(result.id).toBe(999999);
    });

    it('should only remove specified sprite', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      const sprite1 = await service.getRandomSprite();
      await new Promise((res) => setTimeout(res, 1));
      const sprite2 = await service.getRandomSprite();

      service.remove(sprite1.id);

      expect(service.findAll().length).toBe(1);
      expect(service.findOne(sprite1.id)).toBeUndefined();
      expect(service.findOne(sprite2.id)).toBeDefined();
    });
  });

  describe('removeAll', () => {
    it('should delete all sprites and return count', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      await service.getRandomSprite();
      await service.getRandomSprite();
      await service.getRandomSprite();

      const result = service.removeAll();

      expect(result.deleted).toBe(true);
      expect(result.count).toBe(3);
      expect(service.findAll().length).toBe(0);
    });

    it('should return count 0 if no sprites exist', () => {
      const result = service.removeAll();

      expect(result.deleted).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should clear all sprites from memory', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);
      await service.getRandomSprite();
      await service.getRandomSprite();

      service.removeAll();

      expect(service.findAll()).toEqual([]);
    });
  });

  describe('Security Tests (OWASP)', () => {
    it('should use fixed PokeAPI base URL (A10: SSRF)', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);

      await service.getRandomSprite();

      const calledUrl = mockedAxios.get.mock.calls[0][0];
      expect(calledUrl).toMatch(/^https:\/\/pokeapi\.co\/api\/v2/);
    });

    it('should validate response structure (A08: Data Integrity)', async () => {
      const invalidResponses = [
        { data: {} },
        { data: { sprites: {} } },
        { data: { name: 'pikachu' } },
      ];

      for (const invalidResponse of invalidResponses) {
        mockedAxios.get.mockResolvedValue(invalidResponse);
        await expect(service.getRandomSprite()).rejects.toThrow(
          BadGatewayException,
        );
      }
    });

    it('should not expose internal error details to client (A05: Security Misconfiguration)', async () => {
      mockedAxios.get.mockRejectedValue(
        new Error('Internal database connection string: user:pass@host'),
      );

      try {
        await service.getRandomSprite();
      } catch (error) {
        expect(error.message).toBe('Unable to fetch pokemon from external API');
        expect(error.message).not.toContain('database');
        expect(error.message).not.toContain('user:pass');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      mockedAxios.get.mockResolvedValue(mockPokeApiResponse);

      const promises = [
        service.getRandomSprite(),
        service.getRandomSprite(),
        service.getRandomSprite(),
      ];
      const results = await Promise.all(promises);

      expect(results.length).toBe(3);
      expect(service.findAll().length).toBe(3);
    });

    it('should handle malformed response gracefully', async () => {
      mockedAxios.get.mockResolvedValue({ data: null });

      await expect(service.getRandomSprite()).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should handle response with extra properties', async () => {
      const responseWithExtras = {
        data: {
          ...mockPokeApiResponse.data,
          extraField: 'should be ignored',
          anotherExtra: { nested: 'data' },
        },
      };
      mockedAxios.get.mockResolvedValue(responseWithExtras);

      const result = await service.getRandomSprite();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('name');
      expect(Object.keys(result).length).toBe(3);
    });
  });
});
