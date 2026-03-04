import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { GamesService } from './games.service';
import { QueryGameDto } from './dto/query-game.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { AdminOnly } from 'src/common/decorators/admin.decorator';
import { User } from 'src/auth/interfaces/user.interface';
import { GameStockStatus } from './interfaces/game.interface';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Games')
@ApiSecurity('api-key')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiOperation({
    summary: 'Liste filtrée et triée des jeux',
    description:
      'Retourne une liste paginée de jeux avec filtres et tri optionnels.',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    type: String,
    example: 'Platformer',
    description: 'Filtrer par genre',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    type: String,
    example: 'PC',
    description: 'Filtrer par plateforme',
  })
  @ApiQuery({
    name: 'stock',
    required: false,
    enum: GameStockStatus,
    description: 'Filtrer par statut de stock',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'metacritic'],
    description: 'Champ de tri',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Ordre de tri',
  })
  @ApiResponse({ status: 200, description: 'Liste retournée avec succès' })
  @ApiResponse({ status: 400, description: 'Paramètres de requête invalides' })
  @ApiResponse({ status: 401, description: 'Header X-API-Key absent' })
  @Get()
  findAll(@Query() query: QueryGameDto) {
    return this.gamesService.findAll(query);
  }

  @ApiOperation({
    summary: 'Recherche full-text de jeux',
    description: 'Recherche dans le titre, le studio et le synopsis des jeux.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    example: 'Platformer',
    description: 'Terme de recherche',
  })
  @ApiResponse({ status: 200, description: 'Résultats de la recherche' })
  @ApiResponse({
    status: 400,
    description: 'Paramètre de requête "q" manquant',
  })
  @Get('search')
  search(@Query('q') queryParam: string) {
    if (!queryParam?.trim()) {
      throw new BadRequestException('Query param "q" is required');
    }

    return this.gamesService.search(queryParam.trim());
  }

  @ApiOperation({
    summary: 'Récupérer un jeu par ID',
    description:
      "Retourne le détail d'un jeu. Les jeux discontinued sont masqués aux utilisateurs non-admin.",
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID du jeu', example: 1 })
  @ApiResponse({ status: 200, description: 'Jeu récupéré avec succès' })
  @ApiResponse({
    status: 403,
    description: 'Jeu discontinued non visible par les utilisateurs',
  })
  @ApiResponse({ status: 404, description: 'Jeu non trouvé' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: User },
  ) {
    return this.gamesService.findOne(id, req.user);
  }

  @ApiOperation({
    summary: '[Admin] Créer un jeu',
    description: 'Crée un nouveau jeu. Réservé aux administrateurs.',
  })
  @ApiResponse({ status: 201, description: 'Jeu créé avec succès' })
  @ApiResponse({
    status: 403,
    description: 'Accès réservé aux administrateurs',
  })
  @ApiResponse({ status: 409, description: 'Un jeu avec ce titre existe déjà' })
  @AdminOnly()
  @Post()
  @HttpCode(201)
  create(@Body() body: CreateGameDto) {
    return this.gamesService.create(body);
  }

  @ApiOperation({
    summary: '[Admin] Remplacer un jeu',
    description:
      'Remplace entièrement un jeu existant. Réservé aux administrateurs.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID du jeu à remplacer',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Jeu remplacé avec succès' })
  @ApiResponse({
    status: 403,
    description: 'Accès réservé aux administrateurs',
  })
  @ApiResponse({ status: 404, description: 'Jeu non trouvé' })
  @AdminOnly()
  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() body: CreateGameDto) {
    return this.gamesService.replace(id, body);
  }

  @ApiOperation({
    summary: '[Admin] Modifier partiellement un jeu',
    description:
      "Met à jour partiellement un jeu. Réservé aux administrateurs. Ne permet pas de changer le statut d'un jeu discontinué vers un statut disponible.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID du jeu à modifier',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Jeu mis à jour avec succès' })
  @ApiResponse({
    status: 403,
    description: 'Accès réservé aux administrateurs',
  })
  @ApiResponse({ status: 404, description: 'Jeu non trouvé' })
  @ApiResponse({
    status: 422,
    description: 'Transition de statut interdite (discontinued → available)',
  })
  @AdminOnly()
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateGameDto) {
    return this.gamesService.update(id, body);
  }

  @ApiOperation({
    summary: '[Admin] Supprimer un jeu',
    description: 'Supprime définitivement un jeu. Réservé aux administrateurs.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID du jeu à supprimer',
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'Jeu supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Jeu non trouvé' })
  @AdminOnly()
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.gamesService.remove(id);
  }
}
