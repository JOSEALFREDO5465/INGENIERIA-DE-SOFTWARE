import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(usernameOrEmail: string, pass: string): Promise<{ user: UserEntity; token: string }> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      throw new UnauthorizedException('El usuario o correo electrónico ingresado no se encuentra registrado.');
    }

    const isMatch = await bcrypt.compare(pass, user.contrasena);
    if (!isMatch) {
      throw new UnauthorizedException('La contraseña ingresada es incorrecta.');
    }

    if (!user.aprobado) {
      throw new UnauthorizedException('Su solicitud de cuenta está pendiente de evaluación por el Administrador Principal.');
    }

    // Update last access timestamp
    await this.usersService.update(user.id_usuario, {
      ultimo_acceso: new Date().toISOString(),
    });

    // Retrieve fresh data after update
    const freshUser = await this.usersService.findOne(user.id_usuario);
    const userWithoutPassword = { ...freshUser };
    delete (userWithoutPassword as any).contrasena;
    const token = this.jwtService.sign({
      sub: freshUser!.id_usuario,
      rol: freshUser!.rol,
      nombre_usuario: freshUser!.nombre_usuario,
    });
    return { user: userWithoutPassword as UserEntity, token };
  }

  async register(registrationData: Partial<UserEntity>): Promise<UserEntity> {
    const { nombre_usuario, correo } = registrationData;

    // Check unique constraints
    if (nombre_usuario) {
      const existingUser = await this.usersService.findByUsernameOrEmail(nombre_usuario);
      if (existingUser) {
        throw new BadRequestException('El nombre de usuario ya está registrado en el sistema.');
      }
    }

    if (correo) {
      const existingEmail = await this.usersService.findByUsernameOrEmail(correo);
      if (existingEmail) {
        throw new BadRequestException('El correo electrónico ya se encuentra en uso.');
      }
    }

    // Set defaults for requests
    registrationData.aprobado = false; 
    return this.usersService.create(registrationData);
  }
}
