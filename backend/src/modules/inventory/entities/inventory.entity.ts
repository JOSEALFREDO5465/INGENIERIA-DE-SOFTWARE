import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('inventario')
export class InventoryEntity {
  @PrimaryColumn({ name: 'codigo', type: 'varchar' })
  codigo: string;

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string;

  @Column({ name: 'cantidad', type: 'int' })
  cantidad: number;

  @Column({ name: 'unidad', type: 'varchar', default: 'Pz' })
  unidad: 'Pz' | 'Jg' | 'Mts' | 'Otro';

  @Column({ name: 'estado', type: 'varchar', default: 'Bueno' })
  estado: 'Nuevo' | 'Bueno' | 'Mal';

  @Column({ name: 'precio', type: 'float' })
  precio: number;

  @Column({ name: 'moneda', type: 'varchar', default: 'Bs' })
  moneda: 'Bs' | 'Sus';

  @Column({ name: 'procedencia', type: 'varchar', default: 'Comprado' })
  procedencia: 'Comprado' | 'Donación';

  @Column({ name: 'verificacion', type: 'varchar', default: 'Sí' })
  verificacion: 'Sí' | 'No';

  @Column({ name: 'id_ministerio', type: 'int' })
  id_ministerio: number;

  @Column({ name: 'id_grupo', type: 'int', nullable: true })
  id_grupo: number;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string;
}
