# Sujet d'examen — Cours NestJS M2 ESGI IW 2026

En vous basant sur les connaissances acquises pendant le cours et sur l'API Manga créée pendant les TP, construisez une API REST à destination de professionnels du développement logiciel.

Choisissez un sujet parmi les trois ci-dessous. Une fois votre cahier des charges déterminé, créez un dépôt git et invitez **@NicoHersant** en droit de lecture (ou dépôt public). Votre travail sera livré à la fin du cours.

## Thème — GameStoreAPI (catalogue de jeux vidéo)

**Contexte** : API backend pour un store de jeux vidéo indépendant (type Steam). Les développeurs de jeux ont un compte admin, les intégrateurs externes (comparateurs de prix, applications de gestion de collection) ont une clef user.

**Entité principale : Game**
```json
{
  "id": 1,
  "title": "Hollow Knight",
  "studio": "Team Cherry",
  "genres": ["Metroidvania", "Action", "Platformer"],
  "platforms": ["PC", "Switch", "PS4"],
  "releaseDate": "2017-02-24",
  "price": 14.99,
  "metacritic": 90,
  "stock": "available",
  "dlcs": ["Godmaster", "Lifeblood"],
  "synopsis": "..."
}
```

**Spécificités business :**
- Filtres : genre, platform, stock (`available` / `out_of_stock` / `discontinued`)
- Tri par prix et note Metacritic
- Un jeu `discontinued` ne peut pas repasser en `available` (→ 422)
- Un user ne peut pas voir les jeux `discontinued`

---

#### Routes et décorateurs de méthode

| Méthode | Route | Décorateurs attendus |
|---|---|---|
| `GET /games` | Liste filtrée + triée | `@Get()` `@ApiOperation()` `@ApiQuery()` ×5 (genre, platform, stock, sortBy, order) `@ApiResponse()` ×3 (200, 401, 400) |
| `GET /games/search` | Recherche full-text | `@Get('search')` `@ApiOperation()` `@ApiQuery({ name: 'q', required: true })` `@ApiResponse()` ×2 |
| `GET /games/:id` | Détail (masqué si `discontinued` et user) | `@Get(':id')` `@ApiOperation()` `@ApiParam()` `@ApiResponse()` ×3 (200, 403, 404) |
| `POST /games` | Créer un jeu | `@Post()` `@HttpCode(201)` `@AdminOnly()` `@ApiOperation()` `@ApiResponse()` ×3 (201, 403, 409) |
| `PUT /games/:id` | Remplacer un jeu | `@Put(':id')` `@AdminOnly()` `@ApiOperation()` `@ApiParam()` `@ApiResponse()` ×3 |
| `PATCH /games/:id` | Modifier partiellement | `@Patch(':id')` `@AdminOnly()` `@ApiOperation()` `@ApiParam()` `@ApiResponse()` ×3 (200, 404, 422) |
| `DELETE /games/:id` | Supprimer | `@Delete(':id')` `@HttpCode(204)` `@AdminOnly()` `@ApiOperation()` `@ApiParam()` `@ApiResponse()` ×2 (204, 404) |

#### Décorateurs personnalisés à implémenter
- `@Public()` — si certaines routes de lecture sont accessibles sans clef
- `@AdminOnly()` — sur toutes les routes d'écriture

> **Note sur la règle 422** : lancez une `UnprocessableEntityException` depuis le service quand un PATCH tente de faire repasser un jeu `discontinued` en `available`. Documentez cette réponse avec `@ApiResponse({ status: 422, description: 'Transition de statut interdite' })`.

---

## Exigences communes à tous les sujets

### Module Auth (identique au TP manga)

| Route | Annotations requises |
|---|---|
| `POST /auth/register` | `@Public()` `@Post('register')` `@HttpCode(201)` `@ApiOperation()` `@ApiResponse()` ×3 |
| `GET /auth/me` | `@Get('me')` `@ApiOperation()` `@ApiResponse()` ×3 `@ApiHeader()` |
| `POST /auth/regenerate-key` | `@Post('regenerate-key')` `@ApiOperation()` `@ApiResponse()` ×2 |
| `DELETE /auth/account` | `@Delete('account')` `@HttpCode(204)` `@ApiOperation()` `@ApiResponse()` ×2 |

### Guards à implémenter
- **`ApiKeyGuard`** (global) : lit le header `X-API-Key`, attache `req.user`, lève `401` si absent, `403` si invalide ; respecte `@Public()` via `Reflector`
- **`AdminGuard`** (ou intégré dans `ApiKeyGuard`) : lit `req.user.role`, lève `403` si non-admin ; activé par `@AdminOnly()` via `Reflector`

### RegisterDto
```ts
// email
@ApiProperty({ example: 'dev@acme.com' })
@IsEmail()
@IsNotEmpty()
```

### Documentation Swagger
Chaque route doit exposer **a minima** :
- `@ApiOperation({ summary: '...', description: '...' })`
- `@ApiResponse()` pour chaque code HTTP possible (200/201, 400, 401, 403, 404, 409/422)
- `@ApiParam()` sur toute route avec `:id`
- `@ApiQuery()` sur toute route avec des query params
- `@ApiProperty()` sur chaque champ de DTO
