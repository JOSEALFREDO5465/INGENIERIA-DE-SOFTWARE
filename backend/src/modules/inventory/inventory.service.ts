import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryEntity } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {}

  async findAll(): Promise<InventoryEntity[]> {
    return this.inventoryRepository.find({ order: { codigo: 'ASC' } });
  }

  async findOne(codigo: string): Promise<InventoryEntity | null> {
    return this.inventoryRepository.findOne({ where: { codigo } });
  }

  async create(data: Partial<InventoryEntity>): Promise<InventoryEntity> {
    const item = this.inventoryRepository.create(data);
    return this.inventoryRepository.save(item);
  }

  async update(codigo: string, data: Partial<InventoryEntity>): Promise<InventoryEntity | null> {
    const item = await this.findOne(codigo);
    if (!item) return null;
    Object.assign(item, data);
    return this.inventoryRepository.save(item);
  }

  async remove(codigo: string): Promise<boolean> {
    const result = await this.inventoryRepository.delete(codigo);
    return (result.affected ?? 0) > 0;
  }
}
