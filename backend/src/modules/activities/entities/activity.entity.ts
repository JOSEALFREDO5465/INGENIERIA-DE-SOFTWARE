import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('actividades')
export class ActivityEntity {
  @PrimaryGeneratedColumn({ name: 'id_actividad' })
  id_actividad: number;

  @Column({ name: 'fecha', type: 'varchar' })
  fecha: string;

  @Column({ name: 'actividad', type: 'varchar' })
  actividad: string;

  @Column({ name: 'proposito', type: 'varchar' })
  proposito: string;

  @Column({ name: 'hora', type: 'varchar' })
  hora: string;

  @Column({ name: 'responsable', type: 'varchar' })
  responsable: string;

  @Column({ name: 'lugar', type: 'varchar' })
  lugar: string;

  @Column({ name: 'estado', type: 'varchar', default: 'pendiente' })
  estado: 'pendiente' | 'realizado' | 'cancelado';

  @Column({ name: 'meta', type: 'text', nullable: true })
  meta: string;

  @Column({ name: 'id_ministerio', type: 'int' })
  id_ministerio: number;
}
