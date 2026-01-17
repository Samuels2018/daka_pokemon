import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonGateway } from './pokemon.gateway';
import { PokemonController } from './pokemon.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, JwtModule],
  controllers: [PokemonController],
  providers: [PokemonService, PokemonGateway],
  exports: [PokemonService],
})
export class PokemonModule {}
