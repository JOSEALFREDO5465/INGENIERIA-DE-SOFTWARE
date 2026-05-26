import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
  ) {}

  async findAll(): Promise<ActivityEntity[]> {
    return this.activityRepository.find({ order: { id_actividad: 'ASC' } });
  }

  async findOne(id: number): Promise<ActivityEntity | null> {
    return this.activityRepository.findOne({ where: { id_actividad: id } });
  }

  async create(data: Partial<ActivityEntity>): Promise<ActivityEntity> {
    const newActivity = this.activityRepository.create(data);
    return this.activityRepository.save(newActivity);
  }

  async update(id: number, data: Partial<ActivityEntity>): Promise<ActivityEntity | null> {
    const activity = await this.findOne(id);
    if (!activity) return null;
    Object.assign(activity, data);
    return this.activityRepository.save(activity);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.activityRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
