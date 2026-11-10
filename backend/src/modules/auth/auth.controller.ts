import { Controller, Post, Get, Body, HttpCode, HttpStatus, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(CaptchaService)
    private readonly captchaService: CaptchaService
  ) {}

  // Genera el código de verificación (captcha) para el inicio de sesión
  @Get('captcha')
  @HttpCode(HttpStatus.OK)
  async captcha() {
    const { id, imagen, expira_en_segundos } = this.captchaService.generar();
    return {
      success: true,
      message: 'Código de verificación generado.',
      captcha: { id, imagen, expira_en_segundos },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { nombre_usuario: string; contrasena: string; captcha_id?: string; captcha_texto?: string }) {
    try {
      // VALIDACIÓN DEL CAPTCHA (antes de revisar las credenciales)
      const verificacion = this.captchaService.validar(loginDto.captcha_id, loginDto.captcha_texto);
      if (!verificacion.valido) {
        return {
          success: false,
          message: verificacion.mensaje || 'Código de verificación incorrecto.',
          captcha_invalido: true,
        };
      }

      const result = await this.authService.validateUser(
        loginDto.nombre_usuario,
        loginDto.contrasena,
      );
      return {
        success: true,
        message: 'Ingreso autorizado satisfactoriamente.',
        user: result.user,
        token: result.token,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || 'Error de autenticación.',
      };
    }
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    try {
      const newUser = await this.authService.register(registerDto);
      return {
        success: true,
        message: 'Su solicitud fue enviada exitosamente. Favor de esperar la aprobación del Administrador Principal.',
        user: newUser,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || 'Error al procesar la solicitud.',
      };
    }
  }
}
