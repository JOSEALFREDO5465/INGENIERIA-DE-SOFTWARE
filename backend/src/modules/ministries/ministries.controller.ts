import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException, Inject, UseGuards } from '@nestjs/common';
import { MinistriesService } from './ministries.service';
import { MinistryEntity } from './entities/ministry.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('ministries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('pastor', 'secretaria')
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
