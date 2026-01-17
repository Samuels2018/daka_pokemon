/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { BadGatewayException } from '@nestjs/common';

describe('PokemonController', () => {
  let controller: PokemonController;
  let pokemonService: PokemonService;

  const mockSprite = {
    id: 1234567890,
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    name: 'pikachu',
  };

  const mockSprites = [
    mockSprite,
    {
      id: 1234567891,
      url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      name: 'bulbasaur',
    },
  ];

  const mockPokemonService = {
    getRandomSprite: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    pokemonService = module.get<PokemonService>(PokemonService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all sprites', () => {
      mockPokemonService.findAll.mockReturnValue(mockSprites);

      const result = controller.findAll();

      expect(pokemonService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSprites);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no sprites exist', () => {
      mockPokemonService.findAll.mockReturnValue([]);

      const result = controller.findAll();

      expect(result).toEqual([]);
    });

    it('should return array with sprite structure', () => {
      mockPokemonService.findAll.mockReturnValue(mockSprites);

      const result = controller.findAll();

      result.forEach((sprite) => {
        expect(sprite).toHaveProperty('id');
        expect(sprite).toHaveProperty('url');
        expect(sprite).toHaveProperty('name');
      });
    });
  });

  describe('getRandom', () => {
    it('should return a random sprite wrapped in url property', async () => {
      mockPokemonService.getRandomSprite.mockResolvedValue(mockSprite);

      const result = await controller.getRandom();

      expect(pokemonService.getRandomSprite).toHaveBeenCalled();
      expect(result).toEqual({ url: mockSprite });
    });

    it('should call getRandomSprite from service', async () => {
      mockPokemonService.getRandomSprite.mockResolvedValue(mockSprite);

      await controller.getRandom();

      expect(pokemonService.getRandomSprite).toHaveBeenCalledTimes(1);
    });

    it('should throw BadGatewayException on service error', async () => {
      mockPokemonService.getRandomSprite.mockRejectedValue(
        new BadGatewayException('Unable to fetch pokemon from external API'),
      );

      await expect(controller.getRandom()).rejects.toThrow(BadGatewayException);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Network error');
      mockPokemonService.getRandomSprite.mockRejectedValue(error);

      await expect(controller.getRandom()).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete sprite by ID and return result', () => {
      const spriteId = '1234567890';
      const expectedResult = { deleted: true, id: 1234567890 };
      mockPokemonService.remove.mockReturnValue(expectedResult);

      const result = controller.remove(spriteId);
      expect(pokemonService.remove).toHaveBeenCalledWith(1234567890);
      expect(result).toEqual(expectedResult);
    });

    it('should convert string ID to number', () => {
      const spriteId = '999';
      mockPokemonService.remove.mockReturnValue({ deleted: true, id: 999 });

      controller.remove(spriteId);

      expect(pokemonService.remove).toHaveBeenCalledWith(999);
      expect(pokemonService.remove).not.toHaveBeenCalledWith('999');
    });

    it('should return deleted: false if sprite not found', () => {
      const spriteId = '999999';
      const expectedResult = { deleted: false, id: 999999 };
      mockPokemonService.remove.mockReturnValue(expectedResult);

      const result = controller.remove(spriteId);

      expect(result.deleted).toBe(false);
      expect(result.id).toBe(999999);
    });

    it('should handle large ID numbers', () => {
      const largeId = '9999999999';
      mockPokemonService.remove.mockReturnValue({
        deleted: true,
        id: 9999999999,
      });

      controller.remove(largeId);

      expect(pokemonService.remove).toHaveBeenCalledWith(9999999999);
    });
  });

  describe('removeAll', () => {
    it('should delete all sprites and return result', () => {
      const expectedResult = { deleted: true, count: 3 };
      mockPokemonService.removeAll.mockReturnValue(expectedResult);

      const result = controller.removeAll();

      expect(pokemonService.removeAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
      expect(result.count).toBe(3);
    });

    it('should return count 0 if no sprites exist', () => {
      const expectedResult = { deleted: true, count: 0 };
      mockPokemonService.removeAll.mockReturnValue(expectedResult);

      const result = controller.removeAll();

      expect(result.count).toBe(0);
      expect(result.deleted).toBe(true);
    });

    it('should call service removeAll exactly once', () => {
      mockPokemonService.removeAll.mockReturnValue({ deleted: true, count: 5 });

      controller.removeAll();

      expect(pokemonService.removeAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete pokemon workflow', async () => {
      mockPokemonService.getRandomSprite.mockResolvedValue(mockSprite);
      mockPokemonService.findAll.mockReturnValue([mockSprite]);
      mockPokemonService.remove.mockReturnValue({
        deleted: true,
        id: mockSprite.id,
      });

      const randomResult = await controller.getRandom();
      expect(randomResult.url).toEqual(mockSprite);

      const allSprites = controller.findAll();
      expect(allSprites.length).toBeGreaterThan(0);

      const removeResult = controller.remove(mockSprite.id.toString());
      expect(removeResult.deleted).toBe(true);
    });

    it('should handle empty state correctly', () => {
      mockPokemonService.findAll.mockReturnValue([]);
      mockPokemonService.removeAll.mockReturnValue({ deleted: true, count: 0 });

      const findResult = controller.findAll();
      const removeResult = controller.removeAll();

      expect(findResult).toEqual([]);
      expect(removeResult.count).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors in findAll', () => {
      const error = new Error('Service error');
      mockPokemonService.findAll.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.findAll()).toThrow(error);
    });

    it('should handle async errors in getRandom', async () => {
      mockPokemonService.getRandomSprite.mockRejectedValue(
        new BadGatewayException('PokeAPI is down'),
      );

      await expect(controller.getRandom()).rejects.toThrow('PokeAPI is down');
    });

    it('should propagate service errors in remove', () => {
      const error = new Error('Delete failed');
      mockPokemonService.remove.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.remove('123')).toThrow(error);
    });

    it('should propagate service errors in removeAll', () => {
      const error = new Error('Clear failed');
      mockPokemonService.removeAll.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.removeAll()).toThrow(error);
    });
  });

  describe('Data validation', () => {
    it('should return sprites with correct structure from findAll', () => {
      mockPokemonService.findAll.mockReturnValue(mockSprites);

      const result = controller.findAll();

      result.forEach((sprite) => {
        expect(typeof sprite.id).toBe('number');
        expect(typeof sprite.url).toBe('string');
        expect(typeof sprite.name).toBe('string');
        expect(sprite.url).toMatch(/^https?:\/\//);
      });
    });

    it('should return valid sprite object from getRandom', async () => {
      mockPokemonService.getRandomSprite.mockResolvedValue(mockSprite);

      const result = await controller.getRandom();

      expect(result.url).toHaveProperty('id');
      expect(result.url).toHaveProperty('url');
      expect(result.url).toHaveProperty('name');
    });

    it('should handle numeric string IDs in remove', () => {
      mockPokemonService.remove.mockReturnValue({ deleted: true, id: 123 });

      controller.remove('123');

      expect(pokemonService.remove).toHaveBeenCalledWith(123);
    });
  });
});
