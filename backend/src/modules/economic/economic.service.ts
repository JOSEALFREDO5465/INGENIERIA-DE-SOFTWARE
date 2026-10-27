import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EconomicMovementEntity } from './entities/economic-movement.entity';

@Injectable()
export class EconomicService {
  constructor(
    @InjectRepository(EconomicMovementEntity)
    private readonly movementRepository: Repository<EconomicMovementEntity>,
  ) {}

  async create(data: Partial<EconomicMovementEntity>) {
    const fecha = new Date(data.fecha || new Date().toISOString());
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();

    const movement = this.movementRepository.create({
      ...data,
      mes,
      anio,
      fecha: fecha.toISOString().split('T')[0],
    });
    return this.movementRepository.save(movement);
  }

  async findAll() {
    return this.movementRepository.find({
      order: { fecha: 'DESC', id_movimiento: 'DESC' },
    });
  }

  async findByPeriod(mes: number, anio: number) {
    return this.movementRepository.find({
      where: { mes, anio },
      order: { fecha: 'DESC', id_movimiento: 'DESC' },
    });
  }

  async getBalance(mes: number, anio: number) {
    const movements = await this.findByPeriod(mes, anio);

    const ingresos = movements
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    const ofrendas = movements
      .filter((m) => m.tipo === 'ofrenda')
      .reduce((sum, m) => sum + m.monto, 0);
    const egresos = movements
      .filter((m) => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);

    const saldo = ingresos + ofrendas - egresos;

    return {
      mes,
      anio,
      ingresos,
      ofrendas,
      egresos,
      saldo,
      totalMovimientos: movements.length,
    };
  }

  async getAnnualBalance(anio: number) {
    const movements = await this.movementRepository.find({
      where: { anio },
      order: { fecha: 'DESC', id_movimiento: 'DESC' },
    });

    const porMes: Record<number, { ingresos: number; ofrendas: number; egresos: number; saldo: number }> = {};
    for (let m = 1; m <= 12; m++) {
      porMes[m] = { ingresos: 0, ofrendas: 0, egresos: 0, saldo: 0 };
    }

    for (const mov of movements) {
      const cur = porMes[mov.mes];
      if (mov.tipo === 'ingreso') cur.ingresos += mov.monto;
      if (mov.tipo === 'ofrenda') cur.ofrendas += mov.monto;
      if (mov.tipo === 'egreso') cur.egresos += mov.monto;
      cur.saldo = cur.ingresos + cur.ofrendas - cur.egresos;
    }

    const totales = movements.reduce(
      (acc, m) => {
        if (m.tipo === 'ingreso') acc.ingresos += m.monto;
        if (m.tipo === 'ofrenda') acc.ofrendas += m.monto;
        if (m.tipo === 'egreso') acc.egresos += m.monto;
        return acc;
      },
      { ingresos: 0, ofrendas: 0, egresos: 0 },
    );

    return {
      anio,
      porMes,
      totales: {
        ...totales,
        saldo: totales.ingresos + totales.ofrendas - totales.egresos,
      },
    };
  }

  async remove(id: number) {
    const result = await this.movementRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }
    return { success: true };
  }
}
