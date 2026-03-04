export enum GameStockStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export interface Game {
  id: number;
  title: string;
  studio: string;
  genres: string[];
  platforms: string[];
  releaseDate: string;
  price: number;
  metacritic: number;
  stock: GameStockStatus;
  dlcs: string[];
  synopsis: string;
}
