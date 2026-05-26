import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '../members/entities/member.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { MinistryEntity } from '../ministries/entities/ministry.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { UserEntity } from '../users/entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEntity,
      ActivityEntity,
      MinistryEntity,
      GroupEntity,
      UserEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
