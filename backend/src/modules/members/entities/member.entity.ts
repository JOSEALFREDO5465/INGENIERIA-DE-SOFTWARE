import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('miembros')
export class MemberEntity {
  @PrimaryGeneratedColumn({ name: 'id_miembro' })
  id_miembro: number;

  @Column({ name: 'nombres', type: 'varchar' })
  nombres: string;

  @Column({ name: 'apellidos', type: 'varchar' })
  apellidos: string;

  @Column({ name: 'fecha_nacimiento', type: 'varchar' })
  fecha_nacimiento: string;

  @Column({ name: 'lugar_nacimiento', type: 'varchar' })
  lugar_nacimiento: string;

  @Column({ name: 'edad', type: 'int' })
  edad: number;

  @Column({ name: 'sexo', type: 'varchar', default: 'Masculino' })
  sexo: 'Masculino' | 'Femenino';

  @Column({ name: 'estado_civil', type: 'varchar', default: 'Soltero' })
  estado_civil: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo';

  @Column({ name: 'profesion_oficio', type: 'varchar' })
  profesion_oficio: string;

  @Column({ name: 'direccion', type: 'varchar' })
  direccion: string;

  @Column({ name: 'telefono', type: 'bigint' })
  telefono: number;

  @Column({ name: 'ci', type: 'varchar' })
  ci: string;

  @Column({ name: 'conversion', type: 'boolean', default: false })
  conversion: boolean;

  @Column({ name: 'fecha_conversion', type: 'varchar', default: '' })
  fecha_conversion: string;

  @Column({ name: 'lugar_conversion', type: 'varchar', default: '' })
  lugar_conversion: string;

  @Column({ name: 'bautizado', type: 'boolean', default: false })
  bautizado: boolean;

  @Column({ name: 'fecha_bautizo', type: 'varchar', default: '' })
  fecha_bautizo: string;

  @Column({ name: 'lugar_bautizo', type: 'varchar', default: '' })
  lugar_bautizo: string;

  @Column({ name: 'id_grupo', type: 'int', nullable: true })
  id_grupo: number | null;

  @Column({ name: 'estado_miembro', type: 'varchar', default: 'Activo' })
  estado_miembro: 'Activo' | 'Pasivo';

  @Column({ name: 'otros_datos', type: 'text', nullable: true })
  otros_datos: string;

  @Column({ name: 'historial_liderazgo', type: 'text', nullable: true })
  historial_liderazgo: string;

  @Column({ name: 'asiste_grupo', type: 'boolean', default: false })
  asiste_grupo: boolean;

  @Column({ name: 'tipo_miembro', type: 'varchar', default: 'Simpatizante' })
  tipo_miembro: 'Miembro' | 'Simpatizante';

  @Column({ name: 'grupo_categoria', type: 'varchar', default: 'Ninguno' })
  grupo_categoria: 'Ninguno' | 'Jóvenes' | 'Mayores';

  @Column({ name: 'cursos_discipulado', type: 'simple-json', nullable: true })
  cursos_discipulado: string[];

  @Column({ name: 'ministerios_activos', type: 'simple-json', nullable: true })
  ministerios_activos: string[];
}
