import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  Min,
  Max,
  MaxLength,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { GameStockStatus } from '../interfaces/game.interface';

export class CreateGameDto {
  @ApiProperty({ example: 'Outer Wilds', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Mobius Digital', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  studio: string;

  @ApiProperty({ example: ['Adventure', 'Exploration', 'Mystery'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({ example: ['PC', 'PS4', 'PS5', 'Xbox One', 'Xbox Series X'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  platforms: string[];

  @ApiProperty({ example: '2019-05-30' })
  @IsDateString()
  releaseDate: string;

  @ApiProperty({ example: 24.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  metacritic: number;

  @ApiProperty({ enum: GameStockStatus, example: GameStockStatus.AVAILABLE })
  @IsEnum(GameStockStatus, {
    message: 'stock must be one of: available, out_of_stock, discontinued',
  })
  stock: GameStockStatus;

  @ApiProperty({ example: ['Echoes of the Eye'] })
  @IsArray()
  @IsString({ each: true })
  dlcs: string[];

  @ApiProperty({
    example:
      'Explore a solar system stuck in an endless time loop. Unravel the mystery of a lost ancient civilization.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  synopsis: string;
}
