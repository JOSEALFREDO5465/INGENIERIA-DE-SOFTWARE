import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException, Inject, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('pastor')
export class UsersController {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService
  ) {
    console.log('DEBUG: UsersController constructed, usersService?', !!usersService);
  }

  @Get()
  async getAllUsers(): Promise<UserEntity[]> {
    const users = await this.usersService.findAll();
    return users.map((u) => {
      const { contrasena, ...rest } = u as any;
      return rest as UserEntity;
    });
  }

  @Post()
  async createUser(@Body() userData: Partial<UserEntity>): Promise<UserEntity> {
    return this.usersService.create(userData);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const updated = await this.usersService.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return updated;
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const deleted = await this.usersService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return { success: true };
  }

  @Post(':id/approve')
  async approveUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const approved = await this.usersService.approve(id);
    if (!approved) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return approved;
  }

  @Post(':id/reject')
  async rejectUser(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const deleted = await this.usersService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return { success: true };
  }
}
