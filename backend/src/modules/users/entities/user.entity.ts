import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ name: 'nombre_completo', type: 'varchar' })
  nombre_completo: string;

  @Column({ name: 'nombre_usuario', unique: true, type: 'varchar' })
  nombre_usuario: string;

  @Column({ name: 'correo', unique: true, type: 'varchar' })
  correo: string;

  @Column({ name: 'contrasena', type: 'varchar' })
  contrasena: string;

  @Column({ name: 'fecha_registro', type: 'varchar', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: string;

  @Column({ name: 'ultimo_acceso', type: 'varchar', default: '' })
  ultimo_acceso: string;

  @Column({ name: 'rol', type: 'varchar', default: 'secretaria' })
  rol: 'pastor' | 'secretaria' | 'tesorero';

  @Column({ name: 'aprobado', type: 'boolean', default: false })
  aprobado: boolean;
}
