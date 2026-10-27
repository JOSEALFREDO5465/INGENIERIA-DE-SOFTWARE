import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('movimientos_economicos')
export class EconomicMovementEntity {
  @PrimaryGeneratedColumn({ name: 'id_movimiento' })
  id_movimiento: number;

  @Column({ name: 'tipo', type: 'varchar' })
  tipo: 'ingreso' | 'egreso' | 'ofrenda';

  @Column({ name: 'monto', type: 'float' })
  monto: number;

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string;

  @Column({ name: 'fecha', type: 'varchar' })
  fecha: string;

  @Column({ name: 'mes', type: 'int' })
  mes: number;

  @Column({ name: 'anio', type: 'int' })
  anio: number;

  @Column({ name: 'id_ministerio', type: 'int', nullable: true })
  id_ministerio: number | null;

  @Column({ name: 'id_usuario', type: 'int', nullable: true })
  id_usuario: number | null;
}
