import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from './interfaces/user.interface';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@ApiSecurity('api-key')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Enregistrer un nouvel utilisateur',
    description: 'Crée un compte et retourne une clé API.',
  })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur enregistré avec succès',
  })
  @ApiResponse({ status: 400, description: 'Données de validation invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà enregistré' })
  @Public()
  @Post('register')
  @HttpCode(201)
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.email);
  }

  @ApiOperation({
    summary: 'Récupérer les informations de son compte',
    description: "Retourne le profil de l'utilisateur authentifié.",
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: "Clé API de l'utilisateur",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Informations du compte récupérées',
  })
  @ApiResponse({ status: 401, description: 'Header X-API-Key absent' })
  @ApiResponse({ status: 403, description: 'Clé API invalide' })
  @Get('me')
  getMe(@Req() request: Request & { user: User }) {
    const user = request.user;

    return this.authService.getMe(user.apiKey);
  }

  @ApiOperation({
    summary: 'Régénérer sa clé API',
    description: "Génère une nouvelle clé API et invalide l'ancienne.",
  })
  @ApiResponse({ status: 200, description: 'Clé API régénérée avec succès' })
  @ApiResponse({
    status: 401,
    description: 'Header X-API-Key absent ou invalide',
  })
  @Post('regenerate-key')
  regenerateKey(@Req() request: Request & { user: User }) {
    return this.authService.regenerateKey(request.user.apiKey);
  }

  @ApiOperation({
    summary: 'Supprimer son compte',
    description:
      "Supprime définitivement le compte de l'utilisateur authentifié.",
  })
  @ApiResponse({ status: 204, description: 'Compte supprimé avec succès' })
  @ApiResponse({
    status: 401,
    description: 'Header X-API-Key absent ou invalide',
  })
  @Delete('account')
  @HttpCode(204)
  deleteAccount(@Req() request: Request & { user: User }) {
    this.authService.deleteAccount(request.user.apiKey);
  }
}
