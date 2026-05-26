import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, Inject } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryEntity } from './entities/inventory.entity';

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService
  ) {}

  @Get()
  async findAll(): Promise<InventoryEntity[]> {
    return this.inventoryService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<InventoryEntity>): Promise<InventoryEntity> {
    return this.inventoryService.create(data);
  }

  @Put(':codigo')
  async update(
    @Param('codigo') codigo: string,
    @Body() data: Partial<InventoryEntity>,
  ): Promise<InventoryEntity> {
    const updated = await this.inventoryService.update(codigo, data);
    if (!updated) {
      throw new NotFoundException(`Item de inventario con código ${codigo} no encontrado`);
    }
    return updated;
  }

  @Delete(':codigo')
  async remove(@Param('codigo') codigo: string): Promise<{ success: boolean }> {
    const deleted = await this.inventoryService.remove(codigo);
    if (!deleted) {
      throw new NotFoundException(`Item de inventario con código ${codigo} no encontrado`);
    }
    return { success: true };
  }
}
