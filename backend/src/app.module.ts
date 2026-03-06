import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BuildingsModule } from './buildings/buildings.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';
import { PredictModule } from './predict/predict.module';
import { SitesModule } from './sites/sites.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SitesModule,
    BuildingsModule,
    ServicesModule,
    UsersModule,
    PredictModule,
    ReviewsModule,
  ],
})
export class AppModule {}
