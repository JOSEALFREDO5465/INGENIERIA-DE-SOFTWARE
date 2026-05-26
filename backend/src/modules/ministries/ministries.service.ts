import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinistryEntity } from './entities/ministry.entity';

@Injectable()
export class MinistriesService {
  constructor(
    @InjectRepository(MinistryEntity)
    private readonly ministryRepository: Repository<MinistryEntity>,
  ) {}

  async findAll(): Promise<MinistryEntity[]> {
    return this.ministryRepository.find({ order: { id_ministerio: 'ASC' } });
  }

  async findOne(id: number): Promise<MinistryEntity | null> {
    return this.ministryRepository.findOne({ where: { id_ministerio: id } });
  }

  async create(data: Partial<MinistryEntity>): Promise<MinistryEntity> {
    const newMinistry = this.ministryRepository.create(data);
    return this.ministryRepository.save(newMinistry);
  }

  async update(id: number, data: Partial<MinistryEntity>): Promise<MinistryEntity | null> {
    const ministry = await this.findOne(id);
    if (!ministry) return null;
    Object.assign(ministry, data);
    return this.ministryRepository.save(ministry);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.ministryRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
