import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException, Inject, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivityEntity } from './entities/activity.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('pastor', 'secretaria', 'tesorero')
export class ActivitiesController {
  constructor(
    @Inject(ActivitiesService)
    private readonly activitiesService: ActivitiesService
  ) {}

  @Get()
  async findAll(): Promise<ActivityEntity[]> {
    return this.activitiesService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<ActivityEntity>): Promise<ActivityEntity> {
    return this.activitiesService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<ActivityEntity>,
  ): Promise<ActivityEntity> {
    const updated = await this.activitiesService.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const deleted = await this.activitiesService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }
    return { success: true };
  }
}
