import { PrismaModule } from 'src/core/orm/prisma.module';
import { TokenRepository } from './repository/token.repository';
import { Module } from '@nestjs/common';
import { TokenService } from './service/token.service';

@Module({
  imports: [PrismaModule],
  providers: [TokenRepository, TokenService],
  exports: [TokenService, TokenRepository],
})
export class TokenModule {}
