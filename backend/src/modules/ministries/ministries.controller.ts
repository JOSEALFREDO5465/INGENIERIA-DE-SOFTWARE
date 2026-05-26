import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException, Inject } from '@nestjs/common';
import { MinistriesService } from './ministries.service';
import { MinistryEntity } from './entities/ministry.entity';

@Controller('ministries')
export class MinistriesController {
  constructor(
    @Inject(MinistriesService)
    private readonly ministriesService: MinistriesService
  ) {}

  @Get()
  async findAll(): Promise<MinistryEntity[]> {
    return this.ministriesService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<MinistryEntity>): Promise<MinistryEntity> {
    return this.ministriesService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<MinistryEntity>,
  ): Promise<MinistryEntity> {
    const updated = await this.ministriesService.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Ministerio con ID ${id} no encontrado`);
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const deleted = await this.ministriesService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Ministerio con ID ${id} no encontrado`);
    }
    return { success: true };
  }
}
