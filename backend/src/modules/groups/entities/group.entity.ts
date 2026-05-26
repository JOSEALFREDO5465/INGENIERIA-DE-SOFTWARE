import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('grupos_crecimiento')
export class GroupEntity {
  @PrimaryGeneratedColumn({ name: 'id_grupo' })
  id_grupo: number;

  @Column({ name: 'nombre_grupo', type: 'varchar' })
  nombre_grupo: string;

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

  @Column({ name: 'pastor_encargado', type: 'varchar', default: '' })
  pastor_encargado: string;

  @Column({ name: 'fecha_fundacion', type: 'varchar', default: '' })
  fecha_fundacion: string;

  @Column({ name: 'categoria', type: 'varchar', nullable: true })
  categoria: 'Jóvenes' | 'Mayores';
}
