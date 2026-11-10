// UTILIDAD DE EVALUACIÓN DE SEGURIDAD DE CONTRASEÑAS
// Clasifica la contraseña como SEGURA, MEDIA o PELIGROSA y sugiere mejoras.

export type NivelSeguridad = 'peligrosa' | 'media' | 'segura';

export interface ResultadoFuerzaContrasena {
  nivel: NivelSeguridad;
  puntaje: number; // 0 a 100
  etiqueta: string; // texto visible para el usuario
  color: string; // color principal (bordes/texto)
  colorBarra: string; // color de la barra de progreso
  fondoBarra: string; // color de fondo de la barra
  recomendaciones: string[];
}

// Contraseñas más frecuentes: se consideran débiles aunque tengan símbolos
const CONTRASENAS_COMUNES = [
  'password', 'contrasena', 'contraseña', 'admin', 'usuario', 'pastor', 'iglesia',
  '123456', '12345678', '123456789', 'qwerty', 'abc123', '111111', '000000',
  'iloveyou', 'welcome', 'letmein', 'admin123', 'root', 'secret', 'filadelfia',
];

export const evaluarContrasena = (contrasena: string): ResultadoFuerzaContrasena => {
  const valor = contrasena ?? '';
  const recomendaciones: string[] = [];
  let puntaje = 0;

  if (valor.length === 0) {
    return {
      nivel: 'peligrosa',
      puntaje: 0,
      etiqueta: 'Contraseña vacía',
      color: '#64748B',
      colorBarra: '#CBD5E1',
      fondoBarra: '#E2E8F0',
      recomendaciones: ['Escriba una contraseña para evaluar su seguridad.'],
    };
  }

  // Longitud
  if (valor.length >= 6) puntaje += 10;
  if (valor.length >= 8) puntaje += 10;
  if (valor.length >= 12) puntaje += 10;
  if (valor.length < 8) recomendaciones.push('Use al menos 8 caracteres.');

  // Tipos de caracteres
  if (/[A-Z]/.test(valor)) puntaje += 12;
  else recomendaciones.push('Incluya al menos una letra mayúscula.');

  if (/[a-z]/.test(valor)) puntaje += 12;
  else recomendaciones.push('Incluya al menos una letra minúscula.');

  if (/\d/.test(valor)) puntaje += 14;
  else recomendaciones.push('Incluya al menos un número.');

  if (/[^A-Za-z0-9]/.test(valor)) puntaje += 14;
  else recomendaciones.push('Incluya al menos un símbolo (!, @, #, etc.).');

  // Variedad y ausencia de repeticiones
  const unicos = new Set(valor.split('')).size;
  if (unicos >= Math.max(6, valor.length * 0.6)) puntaje += 8;
  else recomendaciones.push('Evite repetir el mismo carácter varias veces.');

  // Secuencias obvias
  if (/^(.)\1+$/.test(valor) || /0123|1234|abcd|qwerty/i.test(valor)) {
    puntaje = Math.max(0, puntaje - 20);
    recomendaciones.push('No use secuencias o caracteres repetidos.');
  }

  // Contraseña incluida en la lista de comunes
  const normalizada = valor.toLowerCase();
  if (CONTRASENAS_COMUNES.some((c) => normalizada.includes(c))) {
    puntaje = Math.max(0, puntaje - 25);
    recomendaciones.push('No use palabras comunes o el nombre de la iglesia.');
  }

  puntaje = Math.max(0, Math.min(100, puntaje));

  if (puntaje >= 70) {
    return {
      nivel: 'segura',
      puntaje,
      etiqueta: 'Contraseña segura',
      color: '#047857',
      colorBarra: '#10B981',
      fondoBarra: '#D1FAE5',
      recomendaciones: recomendaciones.slice(0, 2),
    };
  }

  if (puntaje >= 40) {
    return {
      nivel: 'media',
      puntaje,
      etiqueta: 'Contraseña de seguridad media',
      color: '#B45309',
      colorBarra: '#F59E0B',
      fondoBarra: '#FEF3C7',
      recomendaciones: recomendaciones.slice(0, 3),
    };
  }

  return {
    nivel: 'peligrosa',
    puntaje,
    etiqueta: 'Contraseña peligrosa',
    color: '#B91C1C',
    colorBarra: '#EF4444',
    fondoBarra: '#FEE2E2',
    recomendaciones: recomendaciones.slice(0, 3),
  };
};
