import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { AdminGuard } from './common/guards/admin.guard';

@Module({
  imports: [StorageModule, AuthModule, GamesModule],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_GUARD, useClass: AdminGuard },
    AppService,
  ],
})
export class AppModule {}
