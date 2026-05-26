import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, NotFoundException, Inject } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService
  ) {
    console.log('DEBUG: UsersController constructed, usersService?', !!usersService);
  }

  @Get()
  async getAllUsers(): Promise<UserEntity[]> {
    return this.usersService.findAll();
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
