import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ministerios')
export class MinistryEntity {
  @PrimaryGeneratedColumn({ name: 'id_ministerio' })
  id_ministerio: number;

  @Column({ name: 'nombre_ministerio', type: 'varchar' })
  nombre_ministerio: string;

  @Column({ name: 'mision', type: 'text', nullable: true })
  mision: string;

  @Column({ name: 'vision', type: 'text', nullable: true })
  vision: string;

  @Column({ name: 'lider', type: 'varchar', default: '' })
  lider: string;

  @Column({ name: 'secretario', type: 'varchar', default: '' })
  secretario: string;

  @Column({ name: 'tesorero', type: 'varchar', default: '' })
  tesorero: string;

  @Column({ name: 'vocal_1', type: 'varchar', default: '' })
  vocal_1: string;

  @Column({ name: 'vocal_2', type: 'varchar', default: '' })
  vocal_2: string;
}
