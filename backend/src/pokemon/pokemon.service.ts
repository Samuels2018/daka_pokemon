import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import axios from 'axios';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const MAX_POKEMON_ID = 898;

export interface PokemonSprite {
  id: number;
  url: string;
  name: string;
}

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  private sprites: PokemonSprite[] = [];
  private idCounter = Date.now();

  async getRandomSprite(): Promise<any> {
    try {
      const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;

      const url = `${POKEAPI_BASE}/pokemon/${randomId}`;

      this.logger.log(`Fetching Pokemon with ID: ${randomId}`);

      const response = await axios.get(url, {
        timeout: 5000,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!response.data?.sprites?.front_default) {
        this.logger.warn(
          `Invalid response structure for Pokemon ID: ${randomId}`,
        );
        throw new Error('Invalid response from PokeAPI');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!response.data?.name) {
        this.logger.warn(
          `Missing name in response for Pokemon ID: ${randomId}`,
        );
        throw new Error('Invalid response from PokeAPI');
      }

      const sprite: PokemonSprite = {
        id: Date.now(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        url: response.data.sprites.front_default,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        name: response.data.name,
      };

      // Almacenar sprite en memoria
      this.sprites.push(sprite);

      this.logger.log(`Successfully fetched Pokemon: ${sprite.name}`);

      return sprite;
    } catch (error) {
      this.logger.error('Error fetching pokemon from PokeAPI:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new BadGatewayException('Request to PokeAPI timed out');
        }
        if (error.response?.status === 404) {
          throw new BadGatewayException('Pokemon not found in PokeAPI');
        }
      }

      throw new BadGatewayException(
        'Unable to fetch pokemon from external API',
      );
    }
  }

  create(dto: { url: string; name: string }): PokemonSprite {
    const sprite: PokemonSprite = {
      id: ++this.idCounter,
      url: dto.url,
      name: dto.name,
    };

    this.sprites.push(sprite);
    this.logger.log(`Manual sprite created: ${sprite.name} (ID: ${sprite.id})`);

    return sprite;
  }

  findAll(): PokemonSprite[] {
    return this.sprites;
  }

  findOne(id: number): PokemonSprite | undefined {
    return this.sprites.find((sprite) => sprite.id === id);
  }

  update(
    id: number,
    dto: Partial<{ url: string; name: string }>,
  ): PokemonSprite | null {
    const sprite = this.findOne(id);

    if (!sprite) {
      this.logger.warn(`Sprite with ID ${id} not found for update`);
      return null;
    }

    // Actualizar solo los campos proporcionados
    if (dto.url) sprite.url = dto.url;
    if (dto.name) sprite.name = dto.name;

    this.logger.log(`Sprite with ID ${id} updated`);

    return sprite;
  }

  remove(id: number): { deleted: boolean; id: number } {
    const index = this.sprites.findIndex((sprite) => sprite.id === id);

    if (index !== -1) {
      this.sprites.splice(index, 1);
      this.logger.log(`Sprite with ID ${id} deleted`);
      return { deleted: true, id };
    }

    this.logger.warn(`Sprite with ID ${id} not found for deletion`);
    return { deleted: false, id };
  }

  removeAll(): { deleted: boolean; count: number } {
    const count = this.sprites.length;
    this.sprites = [];

    this.logger.log(`All sprites deleted (count: ${count})`);

    return { deleted: true, count };
  }
}
