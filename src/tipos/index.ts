// ESTE ARCHIVO DEFINE LOS TIPOS DE DATOS DE LA APLICACIÓN BASADO ESTRICTAMENTE EN EL DICCIONARIO DE DATOS DEL PDF.
// ESTA ES LA ESTRUCTURA DE LA TABLA: USUARIO
export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  nombre_usuario: string;
  correo: string;
  contrasena: string;
  fecha_registro: string;
  ultimo_acceso: string;
  rol: 'pastor' | 'secretaria' | 'tesorero';
  aprobado: boolean; // INDICA SI EL ADMINISTRADOR YA ACEPTÓ LA SOLICITUD DE CUENTA
}

// ESTA ES LA ESTRUCTURA DE LA TABLA: MIEMBRO
export interface Miembro {
  id_miembro: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  edad: number;
  sexo: 'Masculino' | 'Femenino';
  estado_civil: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo';
  profesion_oficio: string;
  direccion: string;
  telefono: number;
  ci: string;
  conversion: boolean;
  fecha_conversion: string;
  lugar_conversion: string;
  bautizado: boolean;
  fecha_bautizo: string;
  lugar_bautizo: string;
  id_grupo: number | null; // CLAVE FORÁNEA (FK) - puede ser nulo si elige Ninguno
  estado_miembro: 'Activo' | 'Pasivo';
  otros_datos: string;
  historial_liderazgo: string;
  asiste_grupo: boolean;
  tipo_miembro: 'Miembro' | 'Simpatizante';
  
  // NUEVOS CAMPOS REQUERIDOS POR EL USUARIO
  grupo_categoria?: 'Ninguno' | 'Jóvenes' | 'Mayores';
  cursos_discipulado?: string[]; // Casillas: '101', '201', '301', '401', '501'
  ministerios_activos?: string[]; // Máximo 3 ministerios
}

// ESTA ES LA ESTRUCTURA DE LA TABLA: MINISTERIOS
export interface Ministerio {
  id_ministerio: number;
  nombre_ministerio: string;
  mision: string;
  vision: string;
  lider: string;
  secretario: string;
  tesorero: string;
  vocal_1: string;
  vocal_2: string;
}

// ESTA ES LA ESTRUCTURA DE LA TABLA: GRUPOS DE CRECIMIENTO
export interface GrupoCrecimiento {
  id_grupo: number;
  nombre_grupo: string;
  lider: string;
  secretario: string;
  tesorero: string;
  vocal_1: string;
  vocal_2: string;
  pastor_encargado: string;
  fecha_fundacion: string;
  categoria?: 'Jóvenes' | 'Mayores'; // DIVISIÓN REQUERIDA (Jóvenes o Mayores)
}

// ESTA ES LA ESTRUCTURA DE LA TABLA: INVENTARIO
export interface Inventario {
  codigo: string;
  descripcion: string; // TAMAÑO-COLOR-MEDIDA-MARCA-SERIE-MODELO
  cantidad: number;
  unidad: 'Pz' | 'Jg' | 'Mts' | 'Otro'; // UNIDAD (Pz-Jg)
  estado: 'disponible' | 'en_uso' | 'dano' | 'mantenimiento'; // DISPONIBILIDAD FÍSICA
  ubicacion: string; // UBICACIÓN FÍSICA DEL BIEN
  precio: number; // PRECIO
  moneda: 'Bs' | 'Sus'; // Bs-Sus
  procedencia: 'Comprado' | 'Donación'; // PROCEDENCIA (Comprado-Donacion)
  verificacion: 'Sí' | 'No'; // VERIFICACIÓN
  id_ministerio: number | null; // CLAVE FORÁNEA (FK) al ministerio所属
  id_grupo?: number | null; // CLAVE FORÁNEA OPCIONAL (FK) al grupo de crecimiento
  observaciones: string;
}

// ESTA ES LA ESTRUCTURA DE LA TABLA: ACTIVIDADES
export interface Actividad {
  id_actividad: number;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string | null;
  actividad: string;
  proposito: string;
  responsable: string;
  lugar: string;
  estado: 'pendiente' | 'realizado' | 'cancelado';
  meta: string;
  presupuesto: number;
  costo_real: number;
  id_ministerio: number; // CLAVE FORÁNEA (FK)
}

// ESTA ES LA ESTRUCTURA DE LA TABLA: MOVIMIENTOS ECONÓMICOS
export interface MovimientoEconomico {
  id_movimiento: number;
  tipo: 'ingreso' | 'egreso' | 'ofrenda';
  monto: number;
  descripcion: string;
  fecha: string;
  mes: number;
  anio: number;
  id_ministerio?: number | null;
  id_usuario?: number | null;
}
