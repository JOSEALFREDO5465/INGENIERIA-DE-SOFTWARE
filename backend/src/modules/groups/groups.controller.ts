import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException, Inject, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupEntity } from './entities/group.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('pastor', 'secretaria')
export class GroupsController {
  constructor(
    @Inject(GroupsService)
    private readonly groupsService: GroupsService
  ) {}

  @Get()
  async findAll(): Promise<GroupEntity[]> {
    return this.groupsService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<GroupEntity>): Promise<GroupEntity> {
    return this.groupsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<GroupEntity>,
  ): Promise<GroupEntity> {
    const updated = await this.groupsService.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Grupo de crecimiento con ID ${id} no encontrado`);
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const deleted = await this.groupsService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Grupo de crecimiento con ID ${id} no encontrado`);
    }
    return { success: true };
  }
}
