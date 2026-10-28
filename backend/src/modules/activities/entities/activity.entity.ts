import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('actividades')
export class ActivityEntity {
  @PrimaryGeneratedColumn({ name: 'id_actividad' })
  id_actividad: number;

  @Column({ name: 'fecha', type: 'varchar' })
  fecha: string;

  @Column({ name: 'hora_inicio', type: 'varchar' })
  hora_inicio: string;

  @Column({ name: 'hora_fin', type: 'varchar', nullable: true })
  hora_fin: string | null;

  @Column({ name: 'actividad', type: 'varchar' })
  actividad: string;

  @Column({ name: 'proposito', type: 'varchar' })
  proposito: string;

  @Column({ name: 'responsable', type: 'varchar' })
  responsable: string;

  @Column({ name: 'lugar', type: 'varchar' })
  lugar: string;

  @Column({ name: 'estado', type: 'varchar', default: 'pendiente' })
  estado: 'pendiente' | 'realizado' | 'cancelado';

  @Column({ name: 'meta', type: 'text', nullable: true })
  meta: string;

  @Column({ name: 'presupuesto', type: 'float', default: 0, transformer: { to: (v: number) => v, from: (v: string | number) => (typeof v === 'string' ? parseFloat(v) : v) } })
  presupuesto: number;

  @Column({ name: 'costo_real', type: 'float', default: 0, transformer: { to: (v: number) => v, from: (v: string | number) => (typeof v === 'string' ? parseFloat(v) : v) } })
  costo_real: number;

  @Column({ name: 'id_ministerio', type: 'int' })
  id_ministerio: number;
}
