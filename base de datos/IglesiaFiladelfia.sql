-- ============================================================
-- Base de datos: IglesiaFiladelfia
-- Sistema Web de Gestión y Administración Eclesiástica
-- Motor: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS IglesiaFiladelfia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE IglesiaFiladelfia;

-- ============================================================
-- Tabla: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
  correo VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  fecha_registro VARCHAR(50) DEFAULT NULL,
  ultimo_acceso VARCHAR(50) DEFAULT NULL,
  rol ENUM('pastor', 'secretaria', 'tesorero') NOT NULL DEFAULT 'secretaria',
  aprobado BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX idx_usuarios_rol (rol),
  INDEX idx_usuarios_aprobado (aprobado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: ministerios
-- ============================================================
CREATE TABLE IF NOT EXISTS ministerios (
  id_ministerio INT AUTO_INCREMENT PRIMARY KEY,
  nombre_ministerio VARCHAR(255) NOT NULL,
  mision TEXT,
  vision TEXT,
  lider VARCHAR(255) DEFAULT NULL,
  secretario VARCHAR(255) DEFAULT NULL,
  tesorero VARCHAR(255) DEFAULT NULL,
  vocal_1 VARCHAR(255) DEFAULT NULL,
  vocal_2 VARCHAR(255) DEFAULT NULL,
  INDEX idx_ministerios_nombre (nombre_ministerio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: grupos_crecimiento
-- ============================================================
CREATE TABLE IF NOT EXISTS grupos_crecimiento (
  id_grupo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_grupo VARCHAR(255) NOT NULL,
  lider VARCHAR(255) DEFAULT NULL,
  secretario VARCHAR(255) DEFAULT NULL,
  tesorero VARCHAR(255) DEFAULT NULL,
  vocal_1 VARCHAR(255) DEFAULT NULL,
  vocal_2 VARCHAR(255) DEFAULT NULL,
  pastor_encargado VARCHAR(255) DEFAULT NULL,
  fecha_fundacion VARCHAR(50) DEFAULT NULL,
  categoria ENUM('Jóvenes', 'Mayores') DEFAULT 'Jóvenes',
  INDEX idx_grupos_categoria (categoria),
  INDEX idx_grupos_nombre (nombre_grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: miembros
-- ============================================================
CREATE TABLE IF NOT EXISTS miembros (
  id_miembro INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  fecha_nacimiento VARCHAR(50) DEFAULT NULL,
  lugar_nacimiento VARCHAR(255) DEFAULT NULL,
  edad INT DEFAULT 0,
  sexo ENUM('Masculino', 'Femenino') DEFAULT 'Masculino',
  estado_civil ENUM('Soltero', 'Casado', 'Divorciado', 'Viudo') DEFAULT 'Soltero',
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
  id_grupo INT DEFAULT NULL,
  estado_miembro ENUM('Activo', 'Pasivo') DEFAULT 'Activo',
  otros_datos TEXT,
  historial_liderazgo TEXT,
  asiste_grupo BOOLEAN NOT NULL DEFAULT FALSE,
  tipo_miembro ENUM('Miembro', 'Simpatizante') DEFAULT 'Simpatizante',
  grupo_categoria ENUM('Ninguno', 'Jóvenes', 'Mayores') DEFAULT 'Ninguno',
  cursos_discipulado JSON DEFAULT NULL,
  ministerios_activos JSON DEFAULT NULL,
  INDEX idx_miembros_ci (ci),
  INDEX idx_miembros_id_grupo (id_grupo),
  INDEX idx_miembros_estado (estado_miembro),
  INDEX idx_miembros_tipo (tipo_miembro),
  INDEX idx_miembros_sexo (sexo),
  INDEX idx_miembros_bautizado (bautizado),
  CONSTRAINT fk_miembros_grupo
    FOREIGN KEY (id_grupo) REFERENCES grupos_crecimiento(id_grupo)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: inventario
-- ============================================================
CREATE TABLE IF NOT EXISTS inventario (
  codigo VARCHAR(50) PRIMARY KEY,
  descripcion TEXT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  unidad ENUM('Pz', 'Jg', 'Mts', 'Otro') DEFAULT 'Pz',
  estado ENUM('disponible', 'en_uso', 'dano', 'mantenimiento') DEFAULT 'disponible',
  ubicacion VARCHAR(255) DEFAULT NULL,
  precio FLOAT DEFAULT 0,
  moneda ENUM('Bs', 'Sus') DEFAULT 'Bs',
  procedencia ENUM('Comprado', 'Donación') DEFAULT 'Comprado',
  verificacion ENUM('Sí', 'No') DEFAULT 'Sí',
  id_ministerio INT DEFAULT NULL,
  id_grupo INT DEFAULT NULL,
  observaciones TEXT,
  INDEX idx_inventario_estado (estado),
  INDEX idx_inventario_id_ministerio (id_ministerio),
  INDEX idx_inventario_id_grupo (id_grupo),
  CONSTRAINT fk_inventario_ministerio
    FOREIGN KEY (id_ministerio) REFERENCES ministerios(id_ministerio)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_inventario_grupo
    FOREIGN KEY (id_grupo) REFERENCES grupos_crecimiento(id_grupo)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: actividades
-- ============================================================
CREATE TABLE IF NOT EXISTS actividades (
  id_actividad INT AUTO_INCREMENT PRIMARY KEY,
  fecha VARCHAR(50) DEFAULT NULL,
  hora_inicio VARCHAR(10) DEFAULT NULL,
  hora_fin VARCHAR(10) DEFAULT NULL,
  actividad VARCHAR(255) NOT NULL,
  proposito VARCHAR(255) DEFAULT NULL,
  responsable VARCHAR(255) DEFAULT NULL,
  lugar VARCHAR(255) DEFAULT NULL,
  estado ENUM('pendiente', 'realizado', 'cancelado') DEFAULT 'pendiente',
  meta TEXT,
  presupuesto FLOAT DEFAULT 0,
  costo_real FLOAT DEFAULT 0,
  id_ministerio INT DEFAULT NULL,
  INDEX idx_actividades_fecha (fecha),
  INDEX idx_actividades_lugar (lugar),
  INDEX idx_actividades_responsable (responsable),
  INDEX idx_actividades_id_ministerio (id_ministerio),
  CONSTRAINT fk_actividades_ministerio
    FOREIGN KEY (id_ministerio) REFERENCES ministerios(id_ministerio)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: movimientos_economicos
-- ============================================================
CREATE TABLE IF NOT EXISTS movimientos_economicos (
  id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('ingreso', 'egreso', 'ofrenda') NOT NULL,
  monto FLOAT NOT NULL,
  descripcion TEXT,
  fecha VARCHAR(50) DEFAULT NULL,
  mes INT DEFAULT NULL,
  anio INT DEFAULT NULL,
  id_ministerio INT DEFAULT NULL,
  id_usuario INT DEFAULT NULL,
  INDEX idx_movimientos_tipo (tipo),
  INDEX idx_movimientos_fecha (fecha),
  INDEX idx_movimientos_mes_anio (mes, anio),
  INDEX idx_movimientos_id_ministerio (id_ministerio),
  INDEX idx_movimientos_id_usuario (id_usuario),
  CONSTRAINT fk_movimientos_ministerio
    FOREIGN KEY (id_ministerio) REFERENCES ministerios(id_ministerio)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_movimientos_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  NOW(),
  '',
  'pastor',
  TRUE
);

-- ============================================================
-- Fin del script
-- ============================================================
