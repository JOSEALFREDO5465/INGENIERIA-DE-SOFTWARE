import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomicMovementEntity } from './entities/economic-movement.entity';
import { EconomicService } from './economic.service';
import { EconomicController } from './economic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EconomicMovementEntity])],
  controllers: [EconomicController],
  providers: [EconomicService],
  exports: [EconomicService],
})
export class EconomicModule {}
