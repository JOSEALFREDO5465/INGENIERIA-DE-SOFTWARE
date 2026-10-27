import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException, Inject, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { MemberEntity } from './entities/member.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('pastor', 'secretaria')
export class MembersController {
  constructor(
    @Inject(MembersService)
    private readonly membersService: MembersService
  ) {}

  @Get()
  async findAll(): Promise<MemberEntity[]> {
    return this.membersService.findAll();
  }

  @Post()
  async create(@Body() data: Partial<MemberEntity>): Promise<MemberEntity> {
    return this.membersService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<MemberEntity>,
  ): Promise<MemberEntity> {
    const updated = await this.membersService.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Miembro con ID ${id} no encontrado`);
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const deleted = await this.membersService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Miembro con ID ${id} no encontrado`);
    }
    return { success: true };
  }
}
