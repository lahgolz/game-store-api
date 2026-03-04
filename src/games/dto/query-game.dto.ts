import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GameStockStatus } from '../interfaces/game.interface';

export class QueryGameDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page (max 50)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    example: 'Platformer',
    description: 'Filter by genre',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ example: 'PC', description: 'Filter by platform' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    enum: GameStockStatus,
    description: 'Filter by stock status',
  })
  @IsOptional()
  @IsEnum(GameStockStatus)
  stock?: GameStockStatus;

  @ApiPropertyOptional({
    example: 'price',
    enum: ['price', 'metacritic'],
    description: 'Sort field',
  })
  @IsOptional()
  @IsIn(['price', 'metacritic'])
  sortBy?: 'price' | 'metacritic';

  @ApiPropertyOptional({
    example: 'asc',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
