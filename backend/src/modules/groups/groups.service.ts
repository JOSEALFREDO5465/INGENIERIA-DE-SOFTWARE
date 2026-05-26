import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async findAll(): Promise<GroupEntity[]> {
    return this.groupRepository.find({ order: { id_grupo: 'ASC' } });
  }

  async findOne(id: number): Promise<GroupEntity | null> {
    return this.groupRepository.findOne({ where: { id_grupo: id } });
  }

  async create(data: Partial<GroupEntity>): Promise<GroupEntity> {
    const newGroup = this.groupRepository.create(data);
    return this.groupRepository.save(newGroup);
  }

  async update(id: number, data: Partial<GroupEntity>): Promise<GroupEntity | null> {
    const group = await this.findOne(id);
    if (!group) return null;
    Object.assign(group, data);
    return this.groupRepository.save(group);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.groupRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
