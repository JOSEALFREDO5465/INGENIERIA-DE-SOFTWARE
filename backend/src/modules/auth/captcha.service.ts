import { Injectable } from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';

// ESTADO DE UN DESAFÍO DE VERIFICACIÓN (CAPTCHA)
interface DesafioCaptcha {
  codigo: string;
  expira: number;
  intentos: number;
}

export interface ResultadoValidacionCaptcha {
  valido: boolean;
  mensaje?: string;
}

// SERVICIO DE CAPTCHA: genera el código en el servidor, lo dibuja como imagen SVG
// con deformaciones y ruido, y valida la respuesta enviada por el usuario.
// El código NUNCA viaja en texto plano dentro de la respuesta de la API.
@Injectable()
export class CaptchaService {
  // Alfabeto sin caracteres ambiguos (sin O/0, I/1, L) para evitar confusiones
  private readonly ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  private readonly LONGITUD_CODIGO = 5;
  private readonly DURACION_MS = 5 * 60 * 1000; // 5 minutos de vida útil
  private readonly MAX_INTENTOS = 3;
  private readonly ANCHO = 220;
  private readonly ALTO = 70;

  private readonly desafios = new Map<string, DesafioCaptcha>();

  // Genera un nuevo desafío y devuelve el identificador junto con la imagen
  public generar(): { id: string; imagen: string; expira_en_segundos: number } {
    this.limpiarVencidos();

    let codigo = '';
    for (let i = 0; i < this.LONGITUD_CODIGO; i++) {
      codigo += this.ALFABETO[randomInt(this.ALFABETO.length)];
    }

    const id = randomBytes(16).toString('hex');
    this.desafios.set(id, {
      codigo,
      expira: Date.now() + this.DURACION_MS,
      intentos: 0,
    });

    return {
      id,
      imagen: this.renderizarImagen(codigo),
      expira_en_segundos: Math.floor(this.DURACION_MS / 1000),
    };
  }

  // Valida la respuesta del usuario contra el desafío almacenado
  public validar(id: string | undefined, respuesta: string | undefined): ResultadoValidacionCaptcha {
    if (!id || !respuesta || !respuesta.trim()) {
      return { valido: false, mensaje: 'Ingrese el código de verificación de la imagen.' };
    }

    const desafio = this.desafios.get(id);
    if (!desafio) {
      return { valido: false, mensaje: 'El código de verificación expiró. Genere uno nuevo.' };
    }

    if (Date.now() > desafio.expira) {
      this.desafios.delete(id);
      return { valido: false, mensaje: 'El código de verificación expiró. Genere uno nuevo.' };
    }

    if (desafio.intentos >= this.MAX_INTENTOS) {
      this.desafios.delete(id);
      return { valido: false, mensaje: 'Demasiados intentos fallidos. Genere un nuevo código.' };
    }

    const limpio = respuesta.trim().toUpperCase();
    if (limpio !== desafio.codigo) {
      desafio.intentos += 1;
      if (desafio.intentos >= this.MAX_INTENTOS) {
        this.desafios.delete(id);
        return { valido: false, mensaje: 'Código de verificación incorrecto. Genere un nuevo código de verificación.' };
      }
      return {
        valido: false,
        mensaje: 'Código de verificación incorrecto. Se generó un código nuevo, intente nuevamente.',
      };
    }

    // El desafío es de un solo uso
    this.desafios.delete(id);
    return { valido: true };
  }

  // Limpia los desafíos caducados para no acumular memoria
  private limpiarVencidos(): void {
    const ahora = Date.now();
    for (const [id, desafio] of this.desafios.entries()) {
      if (ahora > desafio.expira) {
        this.desafios.delete(id);
      }
    }
  }

  // Dibuja el código como imagen SVG con rotación, ruido y caracteres distractores
  private renderizarImagen(codigo: string): string {
    const colores = ['#002060', '#4040E0', '#B45309', '#047857', '#B91C1C'];
    const partes: string[] = [];

    // Fondo con gradiente suave
    partes.push(
      `<defs><linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0%" stop-color="#F8FAFF"/><stop offset="100%" stop-color="#EEF1FE"/>` +
      `</linearGradient></defs>`,
      `<rect width="${this.ANCHO}" height="${this.ALTO}" rx="10" fill="url(#fondo)" stroke="#CBD3F0" stroke-width="1.5"/>`,
    );

    // Ruido: puntos aleatorios
    for (let i = 0; i < 90; i++) {
      const x = randomInt(6, this.ANCHO - 6);
      const y = randomInt(6, this.ALTO - 6);
      const r = randomInt(1, 3);
      partes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#94A3B8" opacity="0.35"/>`);
    }

    // Ruido: líneas aleatorias
    for (let i = 0; i < 5; i++) {
      const x1 = randomInt(0, this.ANCHO);
      const y1 = randomInt(0, this.ALTO);
      const x2 = randomInt(0, this.ANCHO);
      const y2 = randomInt(0, this.ALTO);
      partes.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748B" stroke-width="1" opacity="0.4"/>`,
      );
    }

    // Caracteres distractores: se dibujan muy tenues para que el humano los ignore,
    // pero rompen la extracción automática del texto de la imagen.
    for (let i = 0; i < 3; i++) {
      const d = this.ALFABETO[randomInt(this.ALFABETO.length)];
      const dx = randomInt(10, this.ANCHO - 20);
      const dy = randomInt(18, this.ALTO - 8);
      partes.push(
        `<text class="d" x="${dx}" y="${dy}" font-family="Verdana, sans-serif" font-size="20" font-weight="700" fill="#CBD5E1" opacity="0.85" transform="rotate(${randomInt(-35, 35)} ${dx} ${dy})">${d}</text>`,
      );
    }

    // Caracteres reales del código: cada uno con rotación, inclinación y color distinto
    const inicio = 26;
    const paso = 36;
    for (let i = 0; i < codigo.length; i++) {
      const c = codigo[i];
      const x = inicio + i * paso + randomInt(-6, 6);
      const y = this.ALTO / 2 + randomInt(-9, 9);
      const rot = randomInt(-28, 28);
      const color = colores[randomInt(0, colores.length)];
      const tam = randomInt(28, 36);
      partes.push(
        `<text class="c" x="${x}" y="${y}" font-family="Verdana, sans-serif" font-size="${tam}" font-weight="800" fill="${color}" ` +
          `transform="rotate(${rot} ${x} ${y}) skewX(${randomInt(-8, 8)})">${c}</text>`,
      );
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.ANCHO}" height="${this.ALTO}" viewBox="0 0 ${this.ANCHO} ${this.ALTO}">${partes.join('')}</svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
  }
}
