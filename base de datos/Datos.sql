-- ============================================================
-- Datos de ejemplo para la base de datos IglesiaFiladelfia
-- Ejecutar DESPUÉS de IglesiaFiladelfia.sql
-- ============================================================

USE IglesiaFiladelfia;

-- ============================================================
-- Usuarios adicionales (secretaria y tesorero)
-- Contraseña para ambos: Pastor2026!
-- ============================================================
INSERT INTO usuarios (nombre_completo, nombre_usuario, correo, contrasena, fecha_registro, ultimo_acceso, rol, aprobado) VALUES
('María López Secretaria', 'secretaria', 'secretaria@filadelfia.org', '$2b$10$H/pqZKUsOxDzaBCXPC0UFeOyQhUNcQ7RFdIRESUgJvLbKTgAeLS/2', NOW(), '', 'secretaria', TRUE),
('Juan Pérez Tesorero', 'tesorero', 'tesorero@filadelfia.org', '$2b$10$H/pqZKUsOxDzaBCXPC0UFeOyQhUNcQ7RFdIRESUgJvLbKTgAeLS/2', NOW(), '', 'tesorero', TRUE);

-- ============================================================
-- Ministerios
-- ============================================================
INSERT INTO ministerios (nombre_ministerio, mision, vision, lider, secretario, tesorero, vocal_1, vocal_2) VALUES
('Alabanza', 'Proclamar a Dios a través de la música.', 'Ser un ministerio de adoración excelente.', 'Carlos Mamani', 'Ana Torres', 'Pedro Quispe', 'Lucía Flores', 'Marco Rojas'),
('Jóvenes', 'Discipular a la juventud.', 'Jóvenes comprometidos con Cristo.', 'Luis Fernández', 'Carmen Vargas', 'Diego Salazar', 'Rosa Mendoza', 'Jorge Castillo'),
('Niños', 'Enseñar la Palabra a los niños.', 'Niños que aman a Dios.', 'Patricia Gómez', 'Sofía Ruiz', 'Andrés Vega', 'Elena Cabrera', 'Miguel Ángel'),
('Evangelismo', 'Compartir el evangelio.', 'Llevar el mensaje a toda la ciudad.', 'Roberto Sánchez', 'Daniela Paredes', 'Fernando Cruz', 'Valeria Luna', 'Héctor Díaz'),
('Comunión', 'Fomentar la comunión fraternal.', 'Una iglesia unida en amor.', 'Gabriela Morales', 'Andrea Reyes', 'Sebastián Ortiz', 'Camila Herrera', 'Nicolás Reyes'),
('Educación Cristiana', 'Formar discípulos maduros.', 'Enseñanza bíblica sólida.', 'Fernando Álvarez', 'Beatriz Cordero', 'Raúl Méndez', 'Paula Jiménez', 'Tomás Herrera'),
('Damas', 'Servir y edificar a las mujeres.', 'Mujeres virtuosas y serviciales.', 'Teresa Vargas', 'Claudia Ríos', 'Mónica Paredes', 'Patricia Solís', 'Lorena Paz'),
('Varones', 'Formar hombres de Dios.', 'Hombres íntegros y líderes.', 'Ricardo Molina', 'Eduardo Soto', 'Gonzalo Vera', 'Felipe Rojas', 'César Maldonado');

-- ============================================================
-- Grupos de crecimiento
-- Mayores: 1..6 ; Jóvenes: Arca, Unión Radical, Shekiná, 24/7, Revolución, Grupo 7, Ebenezer, Nazaret
-- ============================================================
INSERT INTO grupos_crecimiento (nombre_grupo, lider, secretario, tesorero, vocal_1, vocal_2, pastor_encargado, fecha_fundacion, categoria) VALUES
('Grupo 1', 'Hermano Juan', 'Hermana Rosa', 'Hermano Pedro', 'Hermana Ana', 'Hermano Luis', 'Pastor Principal', '2020-01-15', 'Mayores'),
('Grupo 2', 'Hermano Carlos', 'Hermana María', 'Hermano José', 'Hermana Carmen', 'Hermano Diego', 'Pastor Principal', '2020-03-10', 'Mayores'),
('Grupo 3', 'Hermana Teresa', 'Hermano Miguel', 'Hermana Patricia', 'Hermano Jorge', 'Hermana Sofía', 'Pastor Principal', '2020-05-20', 'Mayores'),
('Grupo 4', 'Hermano Ricardo', 'Hermana Claudia', 'Hermano Fernando', 'Hermana Beatriz', 'Hermano Raúl', 'Pastor Principal', '2020-07-08', 'Mayores'),
('Grupo 5', 'Hermana Gabriela', 'Hermano Eduardo', 'Hermana Mónica', 'Hermano Gonzalo', 'Hermana Paula', 'Pastor Principal', '2020-09-12', 'Mayores'),
('Grupo 6', 'Hermano Roberto', 'Hermana Andrea', 'Hermano Sebastián', 'Hermana Camila', 'Hermano Nicolás', 'Pastor Principal', '2020-11-05', 'Mayores'),
('Arca', 'Líder Arca', 'Sec. Arca', 'Tes. Arca', 'Vocal1 Arca', 'Vocal2 Arca', 'Pastor Principal', '2021-02-14', 'Jóvenes'),
('Unión Radical', 'Líder Unión', 'Sec. Unión', 'Tes. Unión', 'Vocal1 Unión', 'Vocal2 Unión', 'Pastor Principal', '2021-04-20', 'Jóvenes'),
('Shekiná', 'Líder Shekiná', 'Sec. Shekiná', 'Tes. Shekiná', 'Vocal1 Shekiná', 'Vocal2 Shekiná', 'Pastor Principal', '2021-06-15', 'Jóvenes'),
('24/7', 'Líder 24/7', 'Sec. 24/7', 'Tes. 24/7', 'Vocal1 24/7', 'Vocal2 24/7', 'Pastor Principal', '2021-08-10', 'Jóvenes'),
('Revolución', 'Líder Revolución', 'Sec. Revolución', 'Tes. Revolución', 'Vocal1 Revolución', 'Vocal2 Revolución', 'Pastor Principal', '2021-10-05', 'Jóvenes'),
('Grupo 7', 'Líder Grupo 7', 'Sec. Grupo 7', 'Tes. Grupo 7', 'Vocal1 Grupo 7', 'Vocal2 Grupo 7', 'Pastor Principal', '2021-12-01', 'Jóvenes'),
('Ebenezer', 'Líder Ebenezer', 'Sec. Ebenezer', 'Tes. Ebenezer', 'Vocal1 Ebenezer', 'Vocal2 Ebenezer', 'Pastor Principal', '2022-02-18', 'Jóvenes'),
('Nazaret', 'Líder Nazaret', 'Sec. Nazaret', 'Tes. Nazaret', 'Vocal1 Nazaret', 'Vocal2 Nazaret', 'Pastor Principal', '2022-04-22', 'Jóvenes');

-- ============================================================
-- Miembros (ejemplo: ~40 miembros)
-- ============================================================
INSERT INTO miembros (nombres, apellidos, fecha_nacimiento, lugar_nacimiento, edad, sexo, estado_civil, profesion_oficio, direccion, telefono, ci, conversion, fecha_conversion, lugar_conversion, bautizado, fecha_bautizo, lugar_bautizo, id_grupo, estado_miembro, otros_datos, historial_liderazgo, asiste_grupo, tipo_miembro, grupo_categoria, cursos_discipulado, ministerios_activos) VALUES
('Juan', 'Pérez Mamani', '1985-03-15', 'La Paz', 41, 'Masculino', 'Casado', 'Ingeniero', 'Av. 6 de Marzo 123', 71234567, '1234567', TRUE, '2005-06-10', 'Iglesia Filadelfia', TRUE, '2006-08-20', 'Iglesia Filadelfia', 1, 'Activo', 'Familia de 4 integrantes', 'Líder de grupo 1 (2018-2020)', TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Alabanza","Comunión"]'),
('María', 'López Quispe', '1990-07-22', 'El Alto', 35, 'Femenino', 'Soltero', 'Docente', 'Calle 3 Villa Fátima', 72345678, '2345678', TRUE, '2008-09-15', 'Iglesia Filadelfia', TRUE, '2009-11-10', 'Iglesia Filadelfia', 1, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Niños"]'),
('Carlos', 'Mamani Flores', '1978-11-05', 'La Paz', 47, 'Masculino', 'Casado', 'Comerciante', 'Zona Sur', 73456789, '3456789', TRUE, '1998-04-12', 'Iglesia Filadelfia', TRUE, '1999-06-15', 'Iglesia Filadelfia', 2, 'Activo', NULL, 'Tesorero de ministerio Jóvenes', TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Jóvenes","Varones"]'),
('Ana', 'Torres Vargas', '1995-01-30', 'Cochabamba', 31, 'Femenino', 'Soltero', 'Estudiante', 'Av. Arce 456', 74567890, '4567890', TRUE, '2012-02-20', 'Iglesia Filadelfia', FALSE, NULL, NULL, 2, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101"]', '["Alabanza"]'),
('Pedro', 'Quispe Condori', '1982-09-18', 'Oruro', 43, 'Masculino', 'Casado', 'Mecánico', 'Villa Adela', 75678901, '5678901', TRUE, '2000-10-05', 'Iglesia Filadelfia', TRUE, '2001-12-15', 'Iglesia Filadelfia', 3, 'Activo', NULL, 'Líder de grupo 3', TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Varones"]'),
('Lucía', 'Flores Rojas', '1988-05-12', 'La Paz', 37, 'Femenino', 'Casado', 'Enfermera', 'Miraflores', 76789012, '6789012', TRUE, '2003-07-18', 'Iglesia Filadelfia', TRUE, '2004-09-22', 'Iglesia Filadelfia', 3, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401","501"]', '["Comunión","Damas"]'),
('Luis', 'Fernández Cruz', '1992-12-01', 'Santa Cruz', 33, 'Masculino', 'Soltero', 'Abogado', 'Sopocachi', 77890123, '7890123', TRUE, '2010-03-25', 'Iglesia Filadelfia', TRUE, '2011-05-30', 'Iglesia Filadelfia', 4, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Jóvenes","Evangelismo"]'),
('Carmen', 'Vargas Soto', '1998-08-25', 'La Paz', 27, 'Femenino', 'Soltero', 'Diseñadora', 'Calacoto', 78901234, '8901234', TRUE, '2015-01-10', 'Iglesia Filadelfia', FALSE, NULL, NULL, 4, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101"]', '["Damas"]'),
('Diego', 'Salazar Vera', '1980-04-14', 'Tarija', 45, 'Masculino', 'Casado', 'Agricultor', 'Achumani', 79012345, '9012345', TRUE, '1999-08-30', 'Iglesia Filadelfia', TRUE, '2000-10-15', 'Iglesia Filadelfia', 5, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Varones"]'),
('Rosa', 'Mendoza Paz', '1993-06-19', 'La Paz', 32, 'Femenino', 'Casado', 'Contadora', 'San Pedro', 70123456, '0123456', TRUE, '2011-11-12', 'Iglesia Filadelfia', TRUE, '2012-01-20', 'Iglesia Filadelfia', 5, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Comunión"]'),
('Jorge', 'Castillo Rojas', '1987-02-08', 'Potosí', 39, 'Masculino', 'Casado', 'Electricista', 'Obrajes', 71234000, '1122334', TRUE, '2004-05-14', 'Iglesia Filadelfia', TRUE, '2005-07-20', 'Iglesia Filadelfia', 6, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Varones","Evangelismo"]'),
('Sofía', 'Ruiz Cabrera', '1996-10-11', 'La Paz', 29, 'Femenino', 'Soltero', 'Psicóloga', 'Sopocachi', 72345000, '2233445', TRUE, '2013-09-08', 'Iglesia Filadelfia', FALSE, NULL, NULL, 6, 'Activo', NULL, NULL, TRUE, 'Simpatizante', 'Mayores', '["101"]', '[]'),
('Miguel', 'Ángel Vargas', '1984-03-25', 'Cochabamba', 42, 'Masculino', 'Casado', 'Profesor', 'Villa Copacabana', 73456000, '3344556', TRUE, '2002-06-18', 'Iglesia Filadelfia', TRUE, '2003-08-22', 'Iglesia Filadelfia', 1, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Educación Cristiana"]'),
('Elena', 'Cabrera Solís', '1991-07-17', 'La Paz', 34, 'Femenino', 'Casado', 'Abogada', 'San Miguel', 74567000, '4455667', TRUE, '2009-04-12', 'Iglesia Filadelfia', TRUE, '2010-06-18', 'Iglesia Filadelfia', 2, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Damas"]'),
('Andrés', 'Vega Herrera', '1986-12-09', 'Sucre', 39, 'Masculino', 'Casado', 'Médico', 'Zona Sur', 75678000, '5566778', TRUE, '2003-10-20', 'Iglesia Filadelfia', TRUE, '2004-12-25', 'Iglesia Filadelfia', 3, 'Activo', NULL, 'Vocal de ministerio Niños', TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Niños"]'),
('Patricia', 'Gómez Paz', '1994-04-28', 'La Paz', 32, 'Femenino', 'Soltero', 'Nutricionista', 'Miraflores', 76789000, '6677889', TRUE, '2012-02-15', 'Iglesia Filadelfia', FALSE, NULL, NULL, 4, 'Pasivo', 'Se mudó temporalmente', NULL, FALSE, 'Miembro', 'Mayores', '["101"]', '[]'),
('Roberto', 'Sánchez Díaz', '1979-08-16', 'Oruro', 46, 'Masculino', 'Casado', 'Constructor', 'Villa Adela', 77890000, '7788990', TRUE, '1997-06-10', 'Iglesia Filadelfia', TRUE, '1998-08-15', 'Iglesia Filadelfia', 5, 'Activo', NULL, 'Líder de ministerio Evangelismo', TRUE, 'Miembro', 'Mayores', '["101","201","301","401","501"]', '["Evangelismo"]'),
('Gabriela', 'Morales Reyes', '1997-01-20', 'La Paz', 29, 'Femenino', 'Soltero', 'Periodista', 'Calacoto', 78901000, '8899001', TRUE, '2014-03-12', 'Iglesia Filadelfia', TRUE, '2015-05-18', 'Iglesia Filadelfia', 6, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Comunión"]'),
('Fernando', 'Álvarez Jiménez', '1983-06-07', 'Cochabamba', 42, 'Masculino', 'Casado', 'Arquitecto', 'Sopocachi', 79012000, '9900112', TRUE, '2001-09-25', 'Iglesia Filadelfia', TRUE, '2002-11-30', 'Iglesia Filadelfia', 1, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Educación Cristiana"]'),
('Teresa', 'Vargas Solís', '1989-09-14', 'La Paz', 36, 'Femenino', 'Casado', 'Trabajadora Social', 'San Pedro', 70123000, '1011223', TRUE, '2006-07-18', 'Iglesia Filadelfia', TRUE, '2007-09-22', 'Iglesia Filadelfia', 2, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Damas"]'),
('Ricardo', 'Molina Rojas', '1981-05-22', 'Santa Cruz', 44, 'Masculino', 'Casado', 'Administrador', 'Miraflores', 71234001, '2122334', TRUE, '1999-02-10', 'Iglesia Filadelfia', TRUE, '2000-04-15', 'Iglesia Filadelfia', 3, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Varones"]'),
('Claudia', 'Ríos Maldonado', '1992-11-03', 'La Paz', 33, 'Femenino', 'Soltero', 'Diseñadora Gráfica', 'Obrajes', 72345001, '3233445', TRUE, '2010-08-25', 'Iglesia Filadelfia', TRUE, '2011-10-30', 'Iglesia Filadelfia', 4, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Damas"]'),
('Eduardo', 'Soto Vera', '1977-02-14', 'Oruro', 49, 'Masculino', 'Casado', 'Minero', 'Villa Adela', 73456001, '4344556', TRUE, '1996-05-12', 'Iglesia Filadelfia', TRUE, '1997-07-18', 'Iglesia Filadelfia', 5, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Varones"]'),
('Mónica', 'Paredes Paz', '1990-08-29', 'La Paz', 35, 'Femenino', 'Casado', 'Secretaria', 'San Miguel', 74567001, '5455667', TRUE, '2008-01-15', 'Iglesia Filadelfia', TRUE, '2009-03-20', 'Iglesia Filadelfia', 6, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Comunión"]'),
('Gonzalo', 'Vera Herrera', '1985-04-18', 'Sucre', 41, 'Masculino', 'Casado', 'Biólogo', 'Zona Sur', 75678001, '6566778', TRUE, '2002-11-30', 'Iglesia Filadelfia', TRUE, '2003-01-15', 'Iglesia Filadelfia', 1, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Evangelismo"]'),
('Paula', 'Jiménez Solís', '1996-12-12', 'La Paz', 29, 'Femenino', 'Soltero', 'Farmacéutica', 'Miraflores', 76789001, '7677889', TRUE, '2013-06-20', 'Iglesia Filadelfia', FALSE, NULL, NULL, 2, 'Activo', NULL, NULL, TRUE, 'Simpatizante', 'Mayores', '["101"]', '[]'),
('Héctor', 'Díaz Rojas', '1982-07-07', 'Potosí', 43, 'Masculino', 'Casado', 'Chofer', 'Villa Adela', 77890001, '8788990', TRUE, '2000-03-15', 'Iglesia Filadelfia', TRUE, '2001-05-20', 'Iglesia Filadelfia', 3, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Varones"]'),
('Valeria', 'Luna Paz', '1993-02-26', 'La Paz', 33, 'Femenino', 'Casado', 'Veterinaria', 'Calacoto', 78901001, '9899001', TRUE, '2011-09-10', 'Iglesia Filadelfia', TRUE, '2012-11-15', 'Iglesia Filadelfia', 4, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Comunión"]'),
('Tomás', 'Herrera Jiménez', '1988-10-19', 'Cochabamba', 37, 'Masculino', 'Casado', 'Programador', 'Sopocachi', 79012001, '0900112', TRUE, '2005-04-28', 'Iglesia Filadelfia', TRUE, '2006-06-30', 'Iglesia Filadelfia', 5, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Educación Cristiana"]'),
('Lorena', 'Paz Solís', '1995-05-05', 'La Paz', 31, 'Femenino', 'Soltero', 'Fisioterapeuta', 'Miraflores', 70123001, '1012233', TRUE, '2012-08-14', 'Iglesia Filadelfia', FALSE, NULL, NULL, 6, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101"]', '[]'),
('Felipe', 'Rojas Maldonado', '1980-01-28', 'Oruro', 46, 'Masculino', 'Casado', 'Carpintero', 'Villa Adela', 71234002, '2123344', TRUE, '1998-07-22', 'Iglesia Filadelfia', TRUE, '1999-09-28', 'Iglesia Filadelfia', 1, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Varones"]'),
('Nicolás', 'Reyes Herrera', '1984-06-14', 'Santa Cruz', 41, 'Masculino', 'Casado', 'Pescador', 'Achumani', 72345002, '3234455', TRUE, '2001-12-05', 'Iglesia Filadelfia', TRUE, '2003-02-10', 'Iglesia Filadelfia', 2, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Evangelismo"]'),
('Camila', 'Herrera Jiménez', '1991-03-03', 'La Paz', 35, 'Femenino', 'Casado', 'Odontóloga', 'San Miguel', 73456002, '4345566', TRUE, '2009-05-18', 'Iglesia Filadelfia', TRUE, '2010-07-22', 'Iglesia Filadelfia', 3, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Damas","Comunión"]'),
('César', 'Maldonado Solís', '1976-09-09', 'Potosí', 49, 'Masculino', 'Casado', 'Minero', 'Villa Adela', 74567002, '5456677', TRUE, '1995-02-28', 'Iglesia Filadelfia', TRUE, '1996-04-30', 'Iglesia Filadelfia', 4, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401","501"]', '["Varones"]'),
('Sebastián', 'Ortiz Reyes', '1987-11-27', 'La Paz', 38, 'Masculino', 'Casado', 'Ingeniero Civil', 'Obrajes', 75678002, '6567788', TRUE, '2004-08-15', 'Iglesia Filadelfia', TRUE, '2005-10-20', 'Iglesia Filadelfia', 5, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Varones"]'),
('Andrea', 'Reyes Herrera', '1993-04-14', 'Cochabamba', 33, 'Femenino', 'Soltero', 'Bióloga', 'Sopocachi', 76789002, '7678899', TRUE, '2011-01-20', 'Iglesia Filadelfia', TRUE, '2012-03-25', 'Iglesia Filadelfia', 6, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Comunión"]'),
('Beatriz', 'Cordero Jiménez', '1986-07-01', 'La Paz', 39, 'Femenino', 'Casado', 'Química', 'Miraflores', 77890002, '8789900', TRUE, '2003-10-10', 'Iglesia Filadelfia', TRUE, '2004-12-15', 'Iglesia Filadelfia', 1, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Educación Cristiana"]'),
('Raúl', 'Méndez Solís', '1979-03-19', 'Oruro', 47, 'Masculino', 'Casado', 'Geólogo', 'Villa Adela', 78901002, '9890011', TRUE, '1997-09-05', 'Iglesia Filadelfia', TRUE, '1998-11-10', 'Iglesia Filadelfia', 2, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Varones"]'),
('Paula', 'Jiménez Paz', '1994-08-23', 'La Paz', 31, 'Femenino', 'Soltero', 'Arquitecta', 'Calacoto', 79012002, '0901122', TRUE, '2012-04-18', 'Iglesia Filadelfia', FALSE, NULL, NULL, 3, 'Activo', NULL, NULL, TRUE, 'Simpatizante', 'Mayores', '["101"]', '[]'),
('Tomás', 'Herrera Maldonado', '1981-12-05', 'Sucre', 44, 'Masculino', 'Casado', 'Veterinario', 'Achumani', 70123002, '1012233', TRUE, '1999-06-30', 'Iglesia Filadelfia', TRUE, '2000-08-15', 'Iglesia Filadelfia', 4, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301","401"]', '["Varones"]'),
('Lorena', 'Paz Herrera', '1988-01-17', 'La Paz', 38, 'Femenino', 'Casado', 'Psicóloga', 'San Miguel', 71234003, '2123344', TRUE, '2005-10-12', 'Iglesia Filadelfia', TRUE, '2006-12-18', 'Iglesia Filadelfia', 5, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201","301"]', '["Damas"]'),
('Felipe', 'Rojas Solís', '1983-04-26', 'Cochabamba', 42, 'Masculino', 'Casado', 'Ingeniero Mecánico', 'Zona Sur', 72345003, '3234455', TRUE, '2001-03-22', 'Iglesia Filadelfia', TRUE, '2002-05-28', 'Iglesia Filadelfia', 6, 'Activo', NULL, NULL, TRUE, 'Miembro', 'Mayores', '["101","201"]', '["Varones"]'),
('Simpatizante1', 'Invitado Uno', '2000-05-10', 'La Paz', 26, 'Masculino', 'Soltero', 'Estudiante', 'Villa Fátima', 73456003, '4345566', FALSE, NULL, NULL, FALSE, NULL, NULL, 7, 'Activo', 'Asiste ocasionalmente', NULL, FALSE, 'Simpatizante', 'Jóvenes', '[]', '[]'),
('Simpatizante2', 'Invitada Dos', '1999-09-21', 'La Paz', 26, 'Femenino', 'Soltero', 'Estudiante', 'Miraflores', 74567003, '5456677', FALSE, NULL, NULL, FALSE, NULL, NULL, 8, 'Activo', 'Asiste ocasionalmente', NULL, FALSE, 'Simpatizante', 'Jóvenes', '[]', '[]');

-- Asignar miembros a grupos de jóvenes (IDs 15..22 de los grupos jóvenes: 7..14)
-- Actualizar id_grupo de algunos miembros jóvenes
UPDATE miembros SET id_grupo = 7, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (4, 8, 12, 16);
UPDATE miembros SET id_grupo = 8, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (2, 6, 10, 14);
UPDATE miembros SET id_grupo = 9, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (1, 5, 9, 13);
UPDATE miembros SET id_grupo = 10, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (3, 7, 11, 15);
UPDATE miembros SET id_grupo = 11, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (17, 19, 21, 23);
UPDATE miembros SET id_grupo = 12, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (18, 20, 22, 24);
UPDATE miembros SET id_grupo = 13, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (25, 27, 29, 31);
UPDATE miembros SET id_grupo = 14, grupo_categoria = 'Jóvenes' WHERE id_miembro IN (26, 28, 30, 32);

-- ============================================================
-- Inventario
-- ============================================================
INSERT INTO inventario (codigo, descripcion, cantidad, unidad, estado, ubicacion, precio, moneda, procedencia, verificacion, id_ministerio, id_grupo, observaciones) VALUES
('INV-001', 'Guitarra Acústica Yamaha', 2, 'Pz', 'disponible', 'Salón de alabanza', 1200, 'Bs', 'Comprado', 'Sí', 1, NULL, 'En buen estado'),
('INV-002', 'Micrófono Shure SM58', 4, 'Pz', 'disponible', 'Salón de alabanza', 800, 'Bs', 'Comprado', 'Sí', 1, NULL, NULL),
('INV-003', 'Teclado Yamaha PSR-E373', 1, 'Pz', 'en_uso', 'Salón principal', 2500, 'Bs', 'Donación', 'Sí', 1, NULL, 'Donado por hermano Juan'),
('INV-004', 'Sillas plásticas', 100, 'Pz', 'disponible', 'Depósito general', 35, 'Bs', 'Comprado', 'Sí', NULL, NULL, NULL),
('INV-005', 'Mesas plegables', 10, 'Pz', 'disponible', 'Depósito general', 250, 'Bs', 'Comprado', 'Sí', NULL, NULL, NULL),
('INV-006', 'Proyector Epson', 1, 'Pz', 'mantenimiento', 'Oficina', 3500, 'Bs', 'Comprado', 'Sí', 6, NULL, 'En reparación'),
('INV-007', 'Biblia de estudio', 50, 'Pz', 'disponible', 'Biblioteca', 80, 'Bs', 'Donación', 'Sí', 6, NULL, NULL),
('INV-008', 'Equipo de sonido', 1, 'Jg', 'disponible', 'Salón principal', 8000, 'Bs', 'Comprado', 'Sí', 1, NULL, 'Amplificador + parlantes'),
('INV-009', 'Pizarra acrílica', 3, 'Pz', 'disponible', 'Aulas', 120, 'Bs', 'Comprado', 'Sí', 6, NULL, NULL),
('INV-010', 'Computadora de escritorio', 2, 'Pz', 'en_uso', 'Oficina', 4500, 'Bs', 'Comprado', 'Sí', NULL, NULL, NULL),
('INV-011', 'Biblia para niños', 30, 'Pz', 'disponible', 'Aula de niños', 45, 'Bs', 'Donación', 'Sí', 3, NULL, NULL),
('INV-012', 'Juegos didácticos', 15, 'Jg', 'disponible', 'Aula de niños', 60, 'Bs', 'Donación', 'Sí', 3, NULL, NULL),
('INV-013', 'Sillas para niños', 40, 'Pz', 'disponible', 'Aula de niños', 40, 'Bs', 'Comprado', 'Sí', 3, 7, NULL),
('INV-014', 'Guitarra eléctrica', 1, 'Pz', 'dano', 'Salón de alabanza', 1800, 'Bs', 'Comprado', 'No', 1, NULL, 'Cuerdas rotas'),
('INV-015', 'Cables y adaptadores', 20, 'Pz', 'disponible', 'Depósito', 25, 'Bs', 'Comprado', 'Sí', 1, NULL, NULL),
('INV-016', 'Atril para partituras', 5, 'Pz', 'disponible', 'Salón de alabanza', 90, 'Bs', 'Donación', 'Sí', 1, NULL, NULL),
('INV-017', 'Mesa de mezcla', 1, 'Pz', 'disponible', 'Salón principal', 3200, 'Bs', 'Comprado', 'Sí', 1, NULL, NULL),
('INV-018', 'Cámara de video', 1, 'Pz', 'disponible', 'Oficina', 2800, 'Bs', 'Comprado', 'Sí', 4, NULL, 'Para transmisiones'),
('INV-019', 'Triángulos y panderetas', 10, 'Pz', 'disponible', 'Salón de alabanza', 35, 'Bs', 'Donación', 'Sí', 1, NULL, NULL),
('INV-020', 'Libros de enseñanza', 40, 'Pz', 'disponible', 'Biblioteca', 50, 'Bs', 'Donación', 'Sí', 6, NULL, NULL);

-- ============================================================
-- Actividades
-- ============================================================
INSERT INTO actividades (fecha, hora_inicio, hora_fin, actividad, proposito, responsable, lugar, estado, meta, presupuesto, costo_real, id_ministerio) VALUES
('2026-05-03', '09:00', '11:00', 'Culto Dominical', 'Adoración', 'Pastor Principal', 'Templo Principal', 'realizado', 'Asistencia de 200 personas', 500, 480, 1),
('2026-05-05', '19:00', '21:00', 'Reunión de Oración', 'Comunión', 'Carlos Mamani', 'Salón Principal', 'realizado', 'Oración por la ciudad', 100, 90, 5),
('2026-05-10', '10:00', '12:00', 'Clase de Discipulado', 'Discipulado', 'Fernando Álvarez', 'Aula 1', 'realizado', '20 discípulos', 50, 45, 6),
('2026-05-12', '15:00', '17:00', 'Visita de Evangelismo', 'Evangelismo', 'Roberto Sánchez', 'Zona Sur', 'pendiente', 'Visitar 10 hogares', 80, 0, 4),
('2026-05-17', '09:00', '12:00', 'Culto Dominical', 'Adoración', 'Pastor Principal', 'Templo Principal', 'pendiente', 'Asistencia de 220 personas', 500, 0, 1),
('2026-05-20', '18:00', '20:00', 'Vigilia de Jóvenes', 'Adoración', 'Luis Fernández', 'Templo Principal', 'pendiente', 'Jóvenes en oración', 200, 0, 2),
('2026-05-24', '14:00', '16:00', 'Taller de Matrimonios', 'Comunión', 'Gabriela Morales', 'Salón Principal', 'pendiente', '15 matrimonios', 150, 0, 5),
('2026-05-31', '09:00', '11:00', 'Culto Dominical', 'Adoración', 'Pastor Principal', 'Templo Principal', 'pendiente', 'Asistencia de 210 personas', 500, 0, 1);

-- ============================================================
-- Movimientos económicos
-- ============================================================
INSERT INTO movimientos_economicos (tipo, monto, descripcion, fecha, mes, anio, id_ministerio, id_usuario) VALUES
('ingreso', 5000, 'Ofrenda general del domingo', '2026-05-03', 5, 2026, NULL, 1),
('ofrenda', 1200, 'Ofrenda de jóvenes', '2026-05-03', 5, 2026, 2, 1),
('ofrenda', 800, 'Ofrenda de niños', '2026-05-03', 5, 2026, 3, 1),
('ingreso', 3000, 'Diezmos de la semana', '2026-05-07', 5, 2026, NULL, 1),
('egreso', 1500, 'Pago de servicios (luz y agua)', '2026-05-08', 5, 2026, NULL, 1),
('egreso', 500, 'Compra de materiales para niños', '2026-05-10', 5, 2026, 3, 1),
('ofrenda', 1500, 'Ofrenda dominical', '2026-05-10', 5, 2026, NULL, 1),
('egreso', 800, 'Transporte para evangelismo', '2026-05-12', 5, 2026, 4, 1),
('ingreso', 2000, 'Donación especial', '2026-05-15', 5, 2026, NULL, 1),
('ofrenda', 900, 'Ofrenda de damas', '2026-05-17', 5, 2026, 7, 1),
('egreso', 300, 'Compra de biblias', '2026-05-18', 5, 2026, 6, 1),
('ingreso', 4500, 'Ofrenda general del domingo', '2026-05-17', 5, 2026, NULL, 1),
('egreso', 600, 'Refrigerio para reunión de oración', '2026-05-05', 5, 2026, 5, 1),
('ofrenda', 1100, 'Ofrenda de varones', '2026-05-24', 5, 2026, 8, 1),
('ingreso', 3500, 'Diezmos de la semana', '2026-05-21', 5, 2026, NULL, 1),
('egreso', 2000, 'Pago de alquiler de sonido', '2026-05-20', 5, 2026, 1, 1),
('ofrenda', 1300, 'Ofrenda dominical', '2026-05-24', 5, 2026, NULL, 1),
('egreso', 400, 'Material didáctico', '2026-05-25', 5, 2026, 6, 1);

-- ============================================================
-- Fin de datos de ejemplo
-- ============================================================
