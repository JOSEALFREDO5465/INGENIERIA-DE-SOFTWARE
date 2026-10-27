import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { EconomicService } from './economic.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('economic')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('pastor', 'secretaria', 'tesorero')
export class EconomicController {
  constructor(
    @Inject(EconomicService)
    private readonly economicService: EconomicService,
  ) {}

  @Post()
  @Roles('pastor', 'tesorero')
  async create(@Body() data: any) {
    return this.economicService.create(data);
  }

  @Get()
  async findAll() {
    return this.economicService.findAll();
  }

  @Get('balance')
  async getBalance(
    @Query('mes', new ParseIntPipe({ optional: true })) mes?: number,
    @Query('anio', new ParseIntPipe({ optional: true })) anio?: number,
  ) {
    const now = new Date();
    const m = mes ?? now.getMonth() + 1;
    const a = anio ?? now.getFullYear();
    return this.economicService.getBalance(m, a);
  }

  @Get('balance/anual')
  async getAnnualBalance(@Query('anio', new ParseIntPipe()) anio: number) {
    return this.economicService.getAnnualBalance(anio);
  }

  @Delete(':id')
  @Roles('pastor', 'tesorero')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.economicService.remove(id);
  }
}
