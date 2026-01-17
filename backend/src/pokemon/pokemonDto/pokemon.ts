import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdatePokemonDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
