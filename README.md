# GameStoreAPI

A REST API backend for an independent video game store, built with [NestJS](https://nestjs.com). It serves as a catalogue for games, exposing filtered/sorted listings, full-text search, and full CRUD for admins — all secured by API key authentication.

## Features

- **API key authentication** — every request requires an `X-API-Key` header (except registration)
- **Role-based access** — admin keys unlock write operations; user keys are read-only
- **Games catalogue** — filter by genre, platform and stock status; sort by price or Metacritic score
- **Business rules** — discontinued games are hidden from regular users; a discontinued game can never be set back to `available` (HTTP 422)
- **Swagger / Scalar docs** — interactive API documentation available out of the box
- **Bruno collection** — ready-to-use request collection in `bruno/`

## Tech stack

| Layer | Choice |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript |
| Validation | class-validator + class-transformer |
| Documentation | @nestjs/swagger + Scalar |
| Persistence | JSON flat files (`src/data/`) |
| Package manager | pnpm |

## Getting started

```bash
# Install dependencies
pnpm install

# Start in watch mode
pnpm run start:dev
```

The server starts on `http://localhost:3000`.

## API documentation

| URL | Description |
|---|---|
| `http://localhost:3000/api/swagger` | Swagger UI |
| `http://localhost:3000/api/docs` | Scalar UI |
| `http://localhost:3000/api/docs-json` | OpenAPI JSON spec |

## Authentication

All endpoints (except `POST /api/auth/register`) require the header:

```
X-API-Key: <your-api-key>
```

Register to get a key:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@acme.com"}'
# → { "apiKey": "..." }
```

Admin accounts must be set manually in `src/data/users.json` by changing `"role": "user"` to `"role": "admin"`.

## Endpoints

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | None | Create an account, receive an API key |
| `GET` | `/me` | User | Get your account details |
| `POST` | `/regenerate-key` | User | Generate a new API key |
| `DELETE` | `/account` | User | Delete your account |

### Games — `/api/games`

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/games` | User | Filtered + sorted list (paginated) |
| `GET` | `/games/search?q=` | User | Full-text search |
| `GET` | `/games/:id` | User | Game detail (discontinued hidden from users) |
| `POST` | `/games` | Admin | Create a game |
| `PUT` | `/games/:id` | Admin | Replace a game |
| `PATCH` | `/games/:id` | Admin | Partial update (422 if discontinued → available) |
| `DELETE` | `/games/:id` | Admin | Delete a game |

### Query parameters for `GET /games`

| Param | Type | Description |
|---|---|---|
| `genre` | string | Filter by genre (partial match) |
| `platform` | string | Filter by platform (partial match) |
| `stock` | `available` \| `out_of_stock` \| `discontinued` | Filter by stock status |
| `sortBy` | `price` \| `metacritic` | Sort field |
| `order` | `asc` \| `desc` | Sort direction |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Items per page (default: `10`, max: `50`) |

## Project structure

```
src/
├── auth/           # Registration, API key management
├── common/
│   ├── decorators/ # @Public(), @AdminOnly()
│   ├── filters/    # Global HTTP exception filter
│   └── guards/     # ApiKeyGuard (global), AdminGuard (global)
├── data/           # Flat-file persistence (games.json, users.json)
├── games/          # Games CRUD module
└── storage/        # StorageService — JSON read/write abstraction
bruno/              # Bruno API collection + Local environment
```

## Bruno collection

A Bruno collection is available in the `bruno/` directory.

1. Open the `bruno/` folder in the [Bruno](https://www.usebruno.com) desktop app
2. Select the **Local** environment
3. Fill in `apiKey` (from `POST /auth/register`) and `adminApiKey` in the environment secrets
4. Set `gameId` to the ID you want to target for single-resource requests

