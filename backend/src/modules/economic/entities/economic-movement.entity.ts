import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('movimientos_economicos')
export class EconomicMovementEntity {
  @PrimaryGeneratedColumn({ name: 'id_movimiento' })
  id_movimiento: number;

  @Column({ name: 'tipo', type: 'varchar' })
  tipo: 'ingreso' | 'egreso' | 'ofrenda';

  @Column({ name: 'monto', type: 'float', transformer: { to: (v: number) => v, from: (v: string | number) => (typeof v === 'string' ? parseFloat(v) : v) } })
  monto: number;

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string;

  @Column({ name: 'fecha', type: 'varchar', transformer: { to: (v: string) => v, from: (v: any) => (v instanceof Date ? v.toISOString().split('T')[0] : String(v).split('T')[0]) } })
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
