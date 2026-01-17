import {
  Controller,
  Get,
  Delete,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PokemonService, PokemonSprite } from './pokemon.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreatePokemonDto, UpdatePokemonDto } from './pokemonDto/pokemon';

@ApiTags('pokemon')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stored pokemons' })
  @ApiResponse({ status: 200, description: 'Returns list of pokemons.' })
  findAll(): PokemonSprite[] {
    return this.pokemonService.findAll();
  }

  async getRandom() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { url: await this.pokemonService.getRandomSprite() };
  }

  @Delete('all')
  @ApiOperation({ summary: 'Delete all pokemons' })
  @ApiResponse({ status: 200, description: 'All pokemons deleted.' })
  removeAll() {
    return this.pokemonService.removeAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pokemon sprite' })
  @ApiResponse({ status: 200, description: 'Pokemon sprite deleted.' })
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pokemon' })
  @ApiResponse({ status: 201, description: 'Pokemon created successfully.' })
  create(@Body() dto: CreatePokemonDto) {
    const created = this.pokemonService.create(dto);
    return {
      message: 'Pokemon created successfully',
      data: created,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a pokemon' })
  @ApiResponse({ status: 200, description: 'Pokemon updated successfully.' })
  update(@Param('id') id: string, @Body() dto: UpdatePokemonDto) {
    const updated = this.pokemonService.update(+id, dto);
    return {
      message: 'Pokemon updated successfully',
      data: updated,
    };
  }
}
