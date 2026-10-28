-- ============================================================
-- Base de datos: IglesiaFiladelfia (PostgreSQL / Supabase)
-- Sistema Web de Gestión y Administración Eclesiástica
-- Motor: PostgreSQL 15+ (Supabase)
-- ============================================================

-- Nota: En Supabase, la base de datos ya existe (postgres).
-- Ejecuta este script en el SQL Editor de Supabase.

-- ============================================================
-- Tabla: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
  correo VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  fecha_registro VARCHAR(50) DEFAULT NULL,
  ultimo_acceso VARCHAR(50) DEFAULT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'secretaria' CHECK (rol IN ('pastor', 'secretaria', 'tesorero')),
  aprobado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_aprobado ON usuarios(aprobado);

-- ============================================================
-- Tabla: ministerios
-- ============================================================
CREATE TABLE IF NOT EXISTS ministerios (
  id_ministerio SERIAL PRIMARY KEY,
  nombre_ministerio VARCHAR(255) NOT NULL,
  mision TEXT,
  vision TEXT,
  lider VARCHAR(255) DEFAULT NULL,
  secretario VARCHAR(255) DEFAULT NULL,
  tesorero VARCHAR(255) DEFAULT NULL,
  vocal_1 VARCHAR(255) DEFAULT NULL,
  vocal_2 VARCHAR(255) DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_ministerios_nombre ON ministerios(nombre_ministerio);

-- ============================================================
-- Tabla: grupos_crecimiento
-- ============================================================
CREATE TABLE IF NOT EXISTS grupos_crecimiento (
  id_grupo SERIAL PRIMARY KEY,
  nombre_grupo VARCHAR(255) NOT NULL,
  lider VARCHAR(255) DEFAULT NULL,
  secretario VARCHAR(255) DEFAULT NULL,
  tesorero VARCHAR(255) DEFAULT NULL,
  vocal_1 VARCHAR(255) DEFAULT NULL,
  vocal_2 VARCHAR(255) DEFAULT NULL,
  pastor_encargado VARCHAR(255) DEFAULT NULL,
  fecha_fundacion VARCHAR(50) DEFAULT NULL,
  categoria VARCHAR(20) DEFAULT 'Jóvenes' CHECK (categoria IN ('Jóvenes', 'Mayores'))
);

CREATE INDEX IF NOT EXISTS idx_grupos_categoria ON grupos_crecimiento(categoria);
CREATE INDEX IF NOT EXISTS idx_grupos_nombre ON grupos_crecimiento(nombre_grupo);

-- ============================================================
-- Tabla: miembros
-- ============================================================
CREATE TABLE IF NOT EXISTS miembros (
  id_miembro SERIAL PRIMARY KEY,
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  fecha_nacimiento VARCHAR(50) DEFAULT NULL,
  lugar_nacimiento VARCHAR(255) DEFAULT NULL,
  edad INT DEFAULT 0,
  sexo VARCHAR(20) DEFAULT 'Masculino' CHECK (sexo IN ('Masculino', 'Femenino')),
  estado_civil VARCHAR(20) DEFAULT 'Soltero' CHECK (estado_civil IN ('Soltero', 'Casado', 'Divorciado', 'Viudo')),
  profesion_oficio VARCHAR(255) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  telefono BIGINT DEFAULT NULL,
  ci VARCHAR(50) DEFAULT NULL,
  conversion BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_conversion VARCHAR(50) DEFAULT NULL,
  lugar_conversion VARCHAR(255) DEFAULT NULL,
  bautizado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_bautizo VARCHAR(50) DEFAULT NULL,
  lugar_bautizo VARCHAR(255) DEFAULT NULL,
  id_grupo INT DEFAULT NULL REFERENCES grupos_crecimiento(id_grupo) ON DELETE SET NULL ON UPDATE CASCADE,
  estado_miembro VARCHAR(20) DEFAULT 'Activo' CHECK (estado_miembro IN ('Activo', 'Pasivo')),
  otros_datos TEXT,
  historial_liderazgo TEXT,
  asiste_grupo BOOLEAN NOT NULL DEFAULT FALSE,
  tipo_miembro VARCHAR(20) DEFAULT 'Simpatizante' CHECK (tipo_miembro IN ('Miembro', 'Simpatizante')),
  grupo_categoria VARCHAR(20) DEFAULT 'Ninguno' CHECK (grupo_categoria IN ('Ninguno', 'Jóvenes', 'Mayores')),
  cursos_discipulado JSONB DEFAULT NULL,
  ministerios_activos JSONB DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_miembros_ci ON miembros(ci);
CREATE INDEX IF NOT EXISTS idx_miembros_id_grupo ON miembros(id_grupo);
CREATE INDEX IF NOT EXISTS idx_miembros_estado ON miembros(estado_miembro);
CREATE INDEX IF NOT EXISTS idx_miembros_tipo ON miembros(tipo_miembro);
CREATE INDEX IF NOT EXISTS idx_miembros_sexo ON miembros(sexo);
CREATE INDEX IF NOT EXISTS idx_miembros_bautizado ON miembros(bautizado);

-- ============================================================
-- Tabla: inventario
-- ============================================================
CREATE TABLE IF NOT EXISTS inventario (
  codigo VARCHAR(50) PRIMARY KEY,
  descripcion TEXT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  unidad VARCHAR(10) DEFAULT 'Pz' CHECK (unidad IN ('Pz', 'Jg', 'Mts', 'Otro')),
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'en_uso', 'dano', 'mantenimiento')),
  ubicacion VARCHAR(255) DEFAULT NULL,
  precio DOUBLE PRECISION DEFAULT 0,
  moneda VARCHAR(10) DEFAULT 'Bs' CHECK (moneda IN ('Bs', 'Sus')),
  procedencia VARCHAR(20) DEFAULT 'Comprado' CHECK (procedencia IN ('Comprado', 'Donación')),
  verificacion VARCHAR(5) DEFAULT 'Sí' CHECK (verificacion IN ('Sí', 'No')),
  id_ministerio INT DEFAULT NULL REFERENCES ministerios(id_ministerio) ON DELETE SET NULL ON UPDATE CASCADE,
  id_grupo INT DEFAULT NULL REFERENCES grupos_crecimiento(id_grupo) ON DELETE SET NULL ON UPDATE CASCADE,
  observaciones TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventario_estado ON inventario(estado);
CREATE INDEX IF NOT EXISTS idx_inventario_id_ministerio ON inventario(id_ministerio);
CREATE INDEX IF NOT EXISTS idx_inventario_id_grupo ON inventario(id_grupo);

-- ============================================================
-- Tabla: actividades
-- ============================================================
CREATE TABLE IF NOT EXISTS actividades (
  id_actividad SERIAL PRIMARY KEY,
  fecha VARCHAR(50) DEFAULT NULL,
  hora_inicio VARCHAR(10) DEFAULT NULL,
  hora_fin VARCHAR(10) DEFAULT NULL,
  actividad VARCHAR(255) NOT NULL,
  proposito VARCHAR(255) DEFAULT NULL,
  responsable VARCHAR(255) DEFAULT NULL,
  lugar VARCHAR(255) DEFAULT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'realizado', 'cancelado')),
  meta TEXT,
  presupuesto DOUBLE PRECISION DEFAULT 0,
  costo_real DOUBLE PRECISION DEFAULT 0,
  id_ministerio INT DEFAULT NULL REFERENCES ministerios(id_ministerio) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_actividades_fecha ON actividades(fecha);
CREATE INDEX IF NOT EXISTS idx_actividades_lugar ON actividades(lugar);
CREATE INDEX IF NOT EXISTS idx_actividades_responsable ON actividades(responsable);
CREATE INDEX IF NOT EXISTS idx_actividades_id_ministerio ON actividades(id_ministerio);

-- ============================================================
-- Tabla: movimientos_economicos
-- ============================================================
CREATE TABLE IF NOT EXISTS movimientos_economicos (
  id_movimiento SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'egreso', 'ofrenda')),
  monto DOUBLE PRECISION NOT NULL,
  descripcion TEXT,
  fecha VARCHAR(50) DEFAULT NULL,
  mes INT DEFAULT NULL,
  anio INT DEFAULT NULL,
  id_ministerio INT DEFAULT NULL REFERENCES ministerios(id_ministerio) ON DELETE SET NULL ON UPDATE CASCADE,
  id_usuario INT DEFAULT NULL REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos_economicos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_economicos(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_mes_anio ON movimientos_economicos(mes, anio);
CREATE INDEX IF NOT EXISTS idx_movimientos_id_ministerio ON movimientos_economicos(id_ministerio);
CREATE INDEX IF NOT EXISTS idx_movimientos_id_usuario ON movimientos_economicos(id_usuario);

-- ============================================================
-- Usuario administrador inicial
-- Usuario: pastor
-- Contraseña: Pastor2026!
-- Rol: pastor (acceso completo)
-- ============================================================
INSERT INTO usuarios (nombre_completo, nombre_usuario, correo, contrasena, fecha_registro, ultimo_acceso, rol, aprobado)
VALUES (
  'Pastor Principal',
  'pastor',
  'pastor@filadelfia.org',
  '$2b$10$H/pqZKUsOxDzaBCXPC0UFeOyQhUNcQ7RFdIRESUgJvLbKTgAeLS/2',
  NOW()::text,
  '',
  'pastor',
  TRUE
)
ON CONFLICT (nombre_usuario) DO NOTHING;

-- ============================================================
-- Fin del script
-- ============================================================
