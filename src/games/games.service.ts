import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { QueryGameDto } from './dto/query-game.dto';
import { Game, GameStockStatus } from './interfaces/game.interface';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { User } from 'src/auth/interfaces/user.interface';

@Injectable()
export class GamesService {
  constructor(private readonly storage: StorageService) {}

  findAll(query: QueryGameDto) {
    let games = this.storage.read<Game[]>('games.json');

    if (query.genre) {
      games = games.filter((game) =>
        game.genres.some((genre) =>
          genre.toLowerCase().includes(query.genre!.toLowerCase()),
        ),
      );
    }

    if (query.platform) {
      games = games.filter((game) =>
        game.platforms.some((platform) =>
          platform.toLowerCase().includes(query.platform!.toLowerCase()),
        ),
      );
    }

    if (query.stock) {
      games = games.filter((game) => game.stock === query.stock);
    }

    if (query.sortBy) {
      const order = query.order === 'desc' ? -1 : 1;

      games = [...games].sort(
        (a, b) => order * (a[query.sortBy!] - b[query.sortBy!]),
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const start = (page - 1) * limit;

    return {
      data: games.slice(start, start + limit),
      total: games.length,
      page,
      limit,
    };
  }

  findOne(id: number, user?: User): Game {
    const game = this.storage
      .read<Game[]>('games.json')
      .find((game) => game.id === id);

    if (!game) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }

    if (game.stock === GameStockStatus.DISCONTINUED && user?.role !== 'admin') {
      throw new ForbiddenException('This game is not available');
    }

    return game;
  }

  search(queryParam: string): Game[] {
    const term = queryParam.toLowerCase();

    return this.storage
      .read<Game[]>('games.json')
      .filter(
        (game) =>
          game.title.toLowerCase().includes(term) ??
          game.studio.toLowerCase().includes(term) ??
          game.synopsis.toLowerCase().includes(term),
      );
  }

  create(dto: CreateGameDto): Game {
    const games = this.storage.read<Game[]>('games.json');
    const gameWithSameTitle = games.find(
      (game) => game.title.toLowerCase() === dto.title.toLowerCase(),
    );

    if (gameWithSameTitle) {
      throw new ConflictException(
        `A game titled "${dto.title}" already exists`,
      );
    }

    const nextId = Math.max(...games.map((game) => game.id), 0) + 1;
    const newGame: Game = { id: nextId, ...dto };

    this.storage.write('games.json', [...games, newGame]);

    return newGame;
  }

  replace(id: number, dto: CreateGameDto): Game {
    const games = this.storage.read<Game[]>('games.json');
    const index = games.findIndex((game) => game.id === id);

    if (index === -1) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }

    const gameWithSameTitle = games
      .filter((game) => game.id !== id)
      .find((game) => game.title.toLowerCase() === dto.title.toLowerCase());

    if (gameWithSameTitle) {
      throw new ConflictException(
        `A game titled "${dto.title}" already exists`,
      );
    }

    const updated = { id, ...dto };
    games[index] = updated;

    this.storage.write('games.json', games);

    return updated;
  }

  update(id: number, dto: UpdateGameDto): Game {
    const games = this.storage.read<Game[]>('games.json');
    const index = games.findIndex((game) => game.id === id);

    if (index === -1) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }

    if (
      games[index].stock === GameStockStatus.DISCONTINUED &&
      dto.stock !== games[index].stock
    ) {
      throw new UnprocessableEntityException(
        'A discontinued game cannot change stock status',
      );
    }

    const updated = { ...games[index], ...dto };
    games[index] = updated;

    this.storage.write('games.json', games);

    return updated;
  }

  remove(id: number): void {
    const games = this.storage.read<Game[]>('games.json');
    const index = games.findIndex((game) => game.id === id);

    if (index === -1) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }

    games.splice(index, 1);

    this.storage.write('games.json', games);
  }
}
