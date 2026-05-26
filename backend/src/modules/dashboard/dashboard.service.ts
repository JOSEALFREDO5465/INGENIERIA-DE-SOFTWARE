import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from '../members/entities/member.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { MinistryEntity } from '../ministries/entities/ministry.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(MinistryEntity)
    private readonly ministryRepository: Repository<MinistryEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getStats() {
    const totalMembers = await this.memberRepository.count();
    const bautizadosCount = await this.memberRepository.count({ where: { bautizado: true } });
    const totalActivities = await this.activityRepository.count();
    const totalMinistries = await this.ministryRepository.count();
    const totalGroups = await this.groupRepository.count();
    const pendingUsers = await this.userRepository.count({ where: { aprobado: false } });

    return {
      totalMembers,
      bautizadosCount,
      totalActivities,
      totalMinistries,
      totalGroups,
      pendingUsers,
    };
  }
}
