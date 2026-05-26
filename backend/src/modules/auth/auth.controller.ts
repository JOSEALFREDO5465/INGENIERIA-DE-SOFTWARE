import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { nombre_usuario: string; contrasena: string }) {
    try {
      console.log('DEBUG: AuthController.login this.authService exists?', !!this.authService);
      const user = await this.authService.validateUser(
        loginDto.nombre_usuario,
        loginDto.contrasena,
      );
      return {
        success: true,
        message: 'Ingreso autorizado satisfactoriamente.',
        user,
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
